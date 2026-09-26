import streamlit as st
import streamlit.components.v1 as components

# Set page layout to wide if needed
st.set_page_config(layout="wide")

# Read and load Final.html
with open("Final.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Render the HTML content inside the Streamlit app
components.html(html_content, height=800, scrolling=True)
