import base64
from pathlib import Path
import streamlit as st

st.set_page_config(
    page_title="Pixie Dust",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Inject custom CSS to remove Streamlit container padding & scrollbars
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
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# Load index.html and convert to Base64 Data URI for st.iframe
html_path = Path(__file__).parent / "index.html"
if html_path.exists():
    html_bytes = html_path.read_bytes()
    encoded_html = base64.b64encode(html_bytes).decode("utf-8")
    data_uri = f"data:text/html;base64,{encoded_html}"

    # Pass data URI directly into st.iframe
    st.iframe(data_uri)
else:
    st.error("index.html file not found in the root directory.")
