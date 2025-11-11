#!/usr/bin/env python3
"""
Validation script to verify the document processing setup
"""

def validate_imports():
    """Validate that all required imports work"""
    print("Validating imports...")
    
    try:
        import docx
        print("✓ python-docx imported successfully")
    except ImportError as e:
        print(f"✗ python-docx import failed: {e}")
        return False
    
    try:
        import PIL
        print("✓ Pillow imported successfully")
    except ImportError as e:
        print(f"✗ Pillow import failed: {e}")
        return False
    
    try:
        import pytesseract
        print("✓ pytesseract imported successfully")
    except ImportError as e:
        print(f"✗ pytesseract import failed: {e}")
        return False
    
    try:
        from docx import Document
        print("✓ Document class available")
    except ImportError as e:
        print(f"✗ Document import failed: {e}")
        return False
    
    try:
        from PIL import Image
        print("✓ Image class available")
    except ImportError as e:
        print(f"✗ Image import failed: {e}")
        return False
    
    return True

def validate_python_service():
    """Validate that python_service.py can be imported"""
    print("\nValidating python_service.py...")
    
    try:
        # Try to compile the service file
        import py_compile
        py_compile.compile('python_service.py', doraise=True)
        print("✓ python_service.py compiles successfully")
        return True
    except Exception as e:
        print(f"✗ python_service.py compilation failed: {e}")
        return False

def main():
    """Main validation function"""
    print("=== Document Processing Setup Validation ===\n")
    
    imports_valid = validate_imports()
    service_valid = validate_python_service()
    
    print(f"\n=== Results ===")
    print(f"Imports: {'✓ Valid' if imports_valid else '✗ Invalid'}")
    print(f"Service: {'✓ Valid' if service_valid else '✗ Invalid'}")
    
    if imports_valid and service_valid:
        print("\n🎉 All validations passed! Document processing setup is ready.")
        return True
    else:
        print("\n❌ Some validations failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)