
import requests

token = input("Paste your JWT token: ").strip()
file_path = input("Enter the PDF path: ").strip().strip('"')

try:
    with open(file_path, "rb") as pdf_file:
        response = requests.post(
            "http://127.0.0.1:8000/resume/upload",
            headers={
                "Authorization": f"Bearer {token}"
            },
            files={
                "file": (
                    "test_resume.pdf",
                    pdf_file,
                    "application/pdf"
                )
            },
        )

    print("\nHTTP Status:", response.status_code)
    print("Response:", response.text)

except FileNotFoundError:
    print("ERROR: PDF file not found. Check the path.")

except requests.RequestException as error:
    print("Request error:", error)
