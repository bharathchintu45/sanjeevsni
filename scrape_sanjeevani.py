import os
import sys
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# Configurations
PHOTO_PAGES = [
    "https://www.justdial.com/photos/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-gpsywnxgq4-pc-391086322-sco-996q6uaqemm",
    "https://www.justdial.com/photos/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-rfb5mcxc1j-pc-391086312-sco-996q6uaqemm",
    "https://www.justdial.com/photos/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-bo3c4dzu71-pc-391086314-sco-996q6uaqemm",
    "https://www.justdial.com/photos/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-h4qcdbt6l0-pc-391086315-sco-996q6uaqemm",
    "https://www.justdial.com/photos/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-dt0273dtpw-pc-391086317-sco-996q6uaqemm",
    "https://www.justdial.com/photos/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-uulg5b7vzz-pc-391086318-sco-996q6uaqemm",
    "https://www.justdial.com/photos/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-qe015kunqh-pc-391086319-sco-996q6uaqemm"
]

OUTPUT_DIR = r"d:\smart project\sanjeevani\images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper function to download an image
def download_image(url, filepath):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"Successfully downloaded: {filepath}")
            return True
        else:
            print(f"Failed to download: {url} (Status code: {response.status_code})")
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return False

# Initialize WebDriver
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

downloaded_count = 0
try:
    for idx, page_url in enumerate(PHOTO_PAGES, start=1):
        print(f"\n[{idx}/{len(PHOTO_PAGES)}] Processing page: {page_url}")
        
        # Extract the suffix code from the page URL (e.g. gpsywnxgq4)
        # Suffix code is the part before '-pc-'
        part = page_url.split('/')[-1]
        suffix = part.split('-pc-')[0].split('-')[-1]
        
        # We can construct the direct image URL based on the known pattern
        constructed_img_url = f"https://content.jdmagicbox.com/v2/comp/karimnagar/d3/9999px878.x878.170929005658.x4d3/catalogue/sanjeevani-hospital-dharmaram-medaram-karimnagar-hospitals-{suffix}.jpg"
        
        print(f"Constructed URL: {constructed_img_url}")
        filepath = os.path.join(OUTPUT_DIR, f"sanjeevani_{idx}.jpg")
        
        # Try downloading the constructed URL first
        success = download_image(constructed_img_url, filepath)
        if success:
            downloaded_count += 1
            continue
            
        # Fallback to loading the page and finding the image tags
        try:
            driver.get(page_url)
            time.sleep(3)
            images = driver.find_elements(By.TAG_NAME, "img")
            
            found_src = None
            for img in images:
                src = img.get_attribute("src")
                if src and "jdmagicbox.com" in src and suffix in src:
                    found_src = src
                    break
            
            if found_src:
                print(f"Found dynamic URL from page: {found_src}")
                success = download_image(found_src, filepath)
                if success:
                    downloaded_count += 1
            else:
                print("Could not locate specific image on the page, attempting download of first catalogue image found...")
                for img in images:
                    src = img.get_attribute("src")
                    if src and "catalogue" in src and src.endswith(".jpg"):
                        print(f"Attempting download of: {src}")
                        success = download_image(src, filepath)
                        if success:
                            downloaded_count += 1
                            break
        except Exception as pe:
            print(f"Error parsing page {page_url}: {pe}")

    print(f"\nDone! Downloaded {downloaded_count}/{len(PHOTO_PAGES)} images.")
    
except Exception as e:
    print("General Scraper Error:", e)
finally:
    driver.quit()
