from PyPDF2 import PdfReader 
reader=PdfReader('Our Father, Who Art in Hell, Curse Be Thy Name.pdf') 
text=''.join(page.extract_text() or '' for page in reader.pages[:2]) 
print(text[:1000])
