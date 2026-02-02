from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def test_hash():
    password = "password123"
    print(f"Testing hash for: {password}")
    try:
        hashed = pwd_context.hash(password)
        print(f"Hash success: {hashed}")
        
        verify = pwd_context.verify(password, hashed)
        print(f"Verify success: {verify}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_hash()
