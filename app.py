from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Pixie Dust",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Inject custom CSS to remove Streamlit padding, header, footer & scrollbars
st.markdown(
    """
    <style>
        #root > div:nth-child(1) > div > div > div > div {
            padding: 0rem !important;
        }
        header[data-testid="stHeader"] {
            display: none !important;
        }
        footer {
            display: none !important;
        }
        .block-container {
            padding: 0rem !important;
            max-width: 100% !important;
        }
        iframe {
            width: 100vw !important;
            height: 100vh !important;
            border: none !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# Load index.html directly into Streamlit HTML Component
html_path = Path(__file__).parent / "index.html"
if html_path.exists():
    html_content = html_path.read_text(encoding="utf-8")
    components.html(html_content, height=1000, scrolling=False)
else:
    st.error("index.html file not found in the root directory.")
