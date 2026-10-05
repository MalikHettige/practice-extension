# practice-extension
**Repo created**: 05-10-2026

# SVG Picker
Browser extension: click the toolbar icon, hover an inline SVG on any page,
click it, and open it in a viewer tab (light/dark/checker background,
download, copy markup).

## Permissions
- `activeTab`: lets the picker run on the tab where you click the icon
- `scripting`: injects the picker script into that tab

## Limits
- Only inline `<svg>` elements (not `<img src="...svg">` or CSS backgrounds)
- `<use>` sprites from separate files are not resolved
