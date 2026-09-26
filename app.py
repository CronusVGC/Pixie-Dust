import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(layout="wide", initial_sidebar_state="collapsed")

# Minimize Streamlit container padding
st.markdown("""
    <style>
        .block-container {
            padding-top: 0rem;
            padding-bottom: 0rem;
            padding-left: 0rem;
            padding-right: 0rem;
        }
        iframe {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)

# Read the HTML content
with open("Final.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Pass an explicit height in pixels
components.html(html_content, height=1200, scrolling=True)
