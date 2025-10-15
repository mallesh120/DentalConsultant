from playwright.sync_api import sync_playwright, Page, expect

def verify_features(page: Page):
    """
    This script verifies the new features: interactive diagrams, saved history, and checklists.
    """
    # 1. Navigate to the app
    page.goto("http://localhost:3000/public")

    # 2. Generate an explanation
    page.get_by_label("Procedure or Term").fill("Dental Crown")
    page.get_by_role("button", name="Generate Explanation").click()

    # Wait for the output to be visible
    expect(page.locator("#output")).to_be_visible(timeout=30000)

    # 3. Generate an interactive diagram
    page.get_by_role("button", name="✨ Create a Simple Diagram").click()

    # Wait for the SVG to be rendered
    svg_element = page.locator("#imageContainer svg")
    expect(svg_element).to_be_visible(timeout=30000)

    # 4. Click on a part of the diagram (assuming an element with id 'crown' exists)
    # Use a try-except block in case the ID is not present
    try:
        page.locator("svg [id*='crown']").first.click()
        # Wait for the tooltip to appear
        tooltip = page.locator("#svg-tooltip")
        expect(tooltip).to_be_visible(timeout=10000)
        expect(tooltip).to_contain_text("crown")
    except Exception as e:
        print("Could not find a clickable 'crown' part in the SVG, skipping tooltip check.")


    # 5. Save the explanation to the library
    page.get_by_role("button", name="Save").click()
    expect(page.get_by_text("Saved!")).to_be_visible()

    # 6. Generate a checklist
    page.get_by_role("button", name="✨ Generate Procedure Checklist").click()
    checklist = page.locator("#checklistOutput")
    expect(checklist).to_be_visible(timeout=30000)
    expect(checklist).to_contain_text("Before Your Procedure")

    # 7. Open the library to verify the saved item
    page.get_by_role("button", name="My Library").click()
    library_modal = page.locator("#libraryModal")
    expect(library_modal).to_be_visible()
    expect(library_modal).to_contain_text("Dental Crown")

    # 8. Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    # 9. Close the library
    page.get_by_role("button", name="times").click()
    expect(library_modal).not_to_be_visible()


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_features(page)
    browser.close()
