import base64
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Pixie Dust",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Inject CSS to strip Streamlit padding, scrollbars, and extra spacing
st.markdown(
    """
    <style>
        /* Hide Streamlit elements */
        header[data-testid="stHeader"], footer, #MainMenu {
            display: none !important;
        }
        
        /* Remove default margins/padding from Streamlit containers */
        .main .block-container {
            padding: 0rem !important;
            margin: 0rem !important;
            max-width: 100% !important;
        }
        
        /* Ensure app container fills screen without scrollbar */
        div[data-testid="stVerticalBlock"] {
            gap: 0rem !important;
        }

        /* Force iframe container to fill exact viewport height */
        iframe {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            z-index: 999999 !important;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# Load index.html directly into Streamlit components
html_path = Path(__file__).parent / "index.html"
if html_path.exists():
    html_content = html_path.read_text(encoding="utf-8")
    components.html(html_content, height=1000, scrolling=False)
else:
    st.error("index.html file not found in the root directory.")
