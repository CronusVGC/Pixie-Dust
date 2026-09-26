from pathlib import Path
import streamlit as st

# 1. Expand layout and collapse sidebar by default
st.set_page_config(layout="wide", initial_sidebar_state="collapsed")

# 2. Inject CSS to hide Streamlit's top header, footer, and container margins
st.markdown(
    """
    <style>
        /* Hide top header bar and footer */
        header[data-testid="stHeader"] { visibility: hidden; height: 0rem; }
        footer { visibility: hidden; height: 0rem; }
        
        /* Eliminate top padding so content touches the top border */
        .main .block-container {
            padding-top: 0rem !important;
            padding-bottom: 0rem !important;
            padding-left: 0rem !important;
            padding-right: 0rem !important;
            max-width: 100% !important;
        }

        /* Set the iframe wrapper to take full screen height */
        div[data-testid="stIframe"] > iframe {
            height: 98vh !important;
            width: 100% !important;
            border: none;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# 3. Use st.iframe to render the local HTML file dynamically
st.iframe(Path("Final.html"), height="stretch")
