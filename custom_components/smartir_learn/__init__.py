"""SmartIR Learn - IR code learning wizard panel for Home Assistant."""
import logging
import os

from homeassistant.core import HomeAssistant
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.frontend import async_register_built_in_panel

_LOGGER = logging.getLogger(__name__)

DOMAIN = "smartir_learn"
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the SmartIR Learn integration."""
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path="/smartir_learn_frontend",
            path=FRONTEND_DIR,
            cache_headers=False,
        )
    ])

    # Register as a proper custom panel (web component).
    # HA will load the JS module and inject `hass` directly — no auth needed.
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="SmartIR Learn",
        sidebar_icon="mdi:remote",
        frontend_url_path="smartir-learn",
        config={
            "name": "smartir-learn-panel",
            "_panel_custom" : {
                "module_url": "/smartir_learn_frontend/smartir-learn-panel.js",
                "name": "smartir-learn-panel",
            }

        },
        require_admin=True,
    )

    _LOGGER.info("SmartIR Learn panel registered")
    return True

