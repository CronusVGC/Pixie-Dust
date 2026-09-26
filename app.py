import streamlit as st
import streamlit.components.v1 as components

# 1. Expand the workspace area and hide padding
st.set_page_config(layout="wide", initial_sidebar_state="collapsed")

# 2. Add custom CSS to minimize default Streamlit padding
st.markdown("""
    <style>
           .block-container {
                padding-top: 1rem;
                padding-bottom: 1rem;
                padding-left: 2rem;
                padding-right: 2rem;
            }
    </style>
    """, unsafe_allow_html=True)

# 3. Read and render Final.html
with open("Final.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# 4. Use scrolling=True. We remove the fixed 'height' 
# to allow the component to define its own space, 
# letting Streamlit handle the scrolling behavior.
components.html(html_content, scrolling=True, height=None)
