import PyPDF2
import re


def remove_duplicate_whitespace(text: str) -> str:
    return re.sub(r'\s{6,}', ' ', text)


# Open the PDF file in 'rb' mode
with open('example.pdf', 'rb') as pdf_file:

    # Create a PyPDF2 reader object
    pdf_reader = PyPDF2.PdfFileReader(pdf_file)

    # Get the total number of pages in the PDF file
    num_pages = pdf_reader.numPages

    # Initialize an empty string variable to store the text
    text = ""

    # Loop through each page and extract the text
    for page in range(num_pages):
        page_obj = pdf_reader.getPage(page)
        text += page_obj.extractText()


    input_text = "This  is    an   example   with    duplicate   whitespaces."
    output_text = remove_duplicate_whitespace(text)


    # TODO: Strip out whitespace
    # Use a language model to understand the text


# Print the extracted text
print(output_text)


