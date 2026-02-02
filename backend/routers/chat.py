import os
from openai import OpenAI
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, models
from ..database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
)

# Initialize OpenAI client for Ollama
client = OpenAI(
    base_url=os.getenv("OPENAI_API_BASE", "http://localhost:11434/v1"),
    api_key=os.getenv("OPENAI_API_KEY", "ollama"), # Required but ignored by Ollama
)

import re

@router.post("/question", response_model=schemas.ChatResponse)
def chat_question(request: schemas.ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    related_issues = []

    # 1. Search by specific Issue ID (e.g., "Issue 3", "#3", "懸案3", or just "3")
    # regex to find digits
    # specific patterns: "#123", "No.123", "Issue 123", "懸案123", "登録123"
    id_patterns = [
        r"#(\d+)",
        r"No\.?(\d+)",
        r"Issue\s*(\d+)",
        r"懸案\s*(\d+)",
        r"登録\s*(\d+)",
        r"件名\s*(\d+)"
    ]
    
    found_ids = set()
    for pattern in id_patterns:
        matches = re.findall(pattern, request.question, re.IGNORECASE)
        for match in matches:
            found_ids.add(int(match))

    # Also check for standalone numbers if the query is short or mostly numeric
    # But be careful not to pick up dates etc. loosely. 
    # For now, stick to explicit patterns to minimize noise, 
    # or just try to grab all numbers and see if they exist as issues.
    # Let's try grabbing all integers in the string as potential IDs if explicit patterns matched nothing
    if not found_ids:
        all_numbers = re.findall(r"\d+", request.question)
        for num in all_numbers:
             found_ids.add(int(num))

    for issue_id in found_ids:
        issue = crud.get_issue(db, issue_id)
        if issue:
             # Add to head of list as it's likely the specific target
             if not any(existing.issue_id == issue.issue_id for existing in related_issues):
                related_issues.append(issue)

    # 2. Text Keyword Search (Enhanced with AI)
    # Use LLM to extract keywords for better Japanese matching
    keywords = []
    try:
        extraction_prompt = f"""
        ユーザーの質問から、データベース検索に使える「重要なキーワード」を日本語で抽出してください。
        これらはSQLのLIKE検索に使われます。
        
        【ルール】
        1. 英語に翻訳せず、元の日本語の単語をそのまま使ってください。
        2. 助詞（は、が、の、で、て、に）は除去してください。
        3. スペース区切りで出力してください。
        
        例: "ログインができない" -> "ログイン できない"
        例: "画面が真っ白になる" -> "画面 真っ白"
        
        質問: {request.question}
        """
        
        kw_completion = client.chat.completions.create(
            messages=[{
                "role": "user", 
                "content": extraction_prompt
            }],
            model=os.getenv("LLM_MODEL", "mistral"), 
            max_tokens=100
        )
        extracted_text = kw_completion.choices[0].message.content.strip()
        # Clean up formatting
        extracted_text = extracted_text.replace("\n", " ").replace("Keywords:", "").replace("keywords:", "").replace("キーワード:", "")
        # Remove quotes if AI added them
        extracted_text = extracted_text.replace('"', '').replace("'", "")
        
        keywords = [w.strip() for w in extracted_text.split(" ") if w.strip()]
        print(f"=== DEBUG: AI Extracted Keywords: {keywords} ===")
        
    except Exception as e:
        print(f"Keyword Extraction Failed: {e}")
        # Fallback
        keywords = request.question.split(" ")

    # Add original simple split as fallback/addition
    keywords.extend(request.question.split(" "))
    
    for word in keywords:
        # Ignore very short or stop words
        if len(word) > 1 and word not in ["の", "は", "が", "を", "て", "に"]: 
            results = crud.search_issues(db, word)
            for r in results:
                if not any(existing.issue_id == r.issue_id for existing in related_issues):
                    related_issues.append(r)
    
    references = related_issues[:5]

    # Get stats
    total_issues = db.query(models.Issue).count()
    resolved_issues = db.query(models.Issue).filter(models.Issue.resolution != None, models.Issue.resolution != "").count()
    unresolved_issues = total_issues - resolved_issues

    stats_text = (
        f"【現在のシステム状況】\n"
        f"- 全懸案数: {total_issues}件\n"
        f"- 解決済み: {resolved_issues}件\n"
        f"- 未解決: {unresolved_issues}件\n"
    )

    context_text = f"{stats_text}\n"

    if references:
        context_text += "【関連する懸案情報】\n"
        for ref in references:
            status = "解決済み" if ref.resolution and ref.resolution.strip() else "未解決"
            context_text += f"- Issue #{ref.issue_id} (ステータス: {status}): {ref.title}\n  内容: {ref.description}\n  解決策: {ref.resolution or 'なし'}\n"
    else:
        context_text += "質問に関連する特定の懸案は見つかりませんでした。\n"

    system_prompt = f"""あなたは社内システムの管理者およびヘルプデスクAIです。
ユーザーはプロジェクトのメンバーです。以下の[システム状況]および[関連情報]をもとに、ユーザーの質問に日本語で的確に答えてください。
あなたの言葉遣いは自然でプロフェッショナルな日本語（敬語）である必要があります。

【回答のルール】
1. 「解決済み」「未解決」の件数を聞かれた場合は、[システム状況]の数値をそのまま答えてください。
2. 特定のトラブル解決策を聞かれた場合は、[関連情報]を参照してください。
3. 知識にないことを聞かれた場合は、正直に「情報がありません」と答えてください。嘘をついてはいけません。
4. 「Context」や「学習データ」というメタな単語は使わず、「システムの情報によると」や「登録データでは」という表現を使ってください。

[情報ソース]
{context_text}
"""
    print(f"=== DEBUG SYSTEM PROMPT ===\n{system_prompt}\n===========================")

    # 3. Call Ollama (via OpenAI compatible API)
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": request.question,
                }
            ],
            model=os.getenv("LLM_MODEL", "qwen2.5:3b"), # Use env or default
            temperature=0.3, # Lower temperature for factual accuracy
        )
        answer_text = chat_completion.choices[0].message.content
    except Exception as e:
        print(f"LLM Error: {e}")
        answer_text = "申し訳ありません。AIサーバーへの接続でエラーが発生しました。\n(詳細はサーバーログを確認してください)"

    return schemas.ChatResponse(
        answer=answer_text,
        references=references
    )
