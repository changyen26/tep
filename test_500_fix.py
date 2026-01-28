import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait

# ==========================================
#              使用前請修改這裡
# ==========================================
FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe8a03_zs77L-sWUPVPZz1Z1NxRvr-qaT-5aNV-ZCCDsCScRQ/viewform?fbzx=3069216166497371432"
TEST_COUNT = 10
# ==========================================

def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--incognito")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)

    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

def fill_google_form_smart(driver):
    driver.get(FORM_URL)
    wait = WebDriverWait(driver, 10)

    strategies = {
        "主動去宮廟": {"weights": [15, 50, 30, 15]},
        "進到宮廟時": {"weights": [10, 25, 40, 20, 5]},
        "不會主動": {"weights": [60, 50, 30, 20, 10, 10, 0], "k_range": (1, 3)},
        "遇過以下情況": {"weights": [50, 30, 30, 20, 50, 40, 5], "k_range": (1, 3)},
        "降低你的壓力": {"weights": [5, 5, 10, 40, 40]},
        "隨身攜帶": {"weights": [5, 20, 40, 35]},
        "Q7.": {"weights": [45, 50, 40, 35, 10, 0, 0], "k_range": (1, 3)},
        "融入日常穿搭": {"weights": [0, 5, 10, 35, 50]},
        "手機中的數位": {"weights": [0, 5, 15, 40, 40]},
        "最能接受": {"weights": [10, 30, 10, 50, 0]},
        "拜拜結束後": {"weights": [30, 20, 40, 10]},
        "被紀錄": {"weights": [0, 5, 25, 40, 30]},
        "成就或公益": {"weights": [0, 0, 10, 30, 60]},
        "解決你的哪個問題": {"weights": [15, 40, 45, 0]},
        "Q15": {"weights": [0, 0, 10, 40, 50]},
    }

    while True:
        try:
            time.sleep(1.5)

            questions = driver.find_elements(By.CSS_SELECTOR, 'div[role="listitem"]')

            for q in questions:
                q_text = q.text

                # ---------- 單選 ----------
                radios = q.find_elements(By.CSS_SELECTOR, 'div[role="radio"]')
                if radios:
                    if any("true" in r.get_attribute("aria-checked") for r in radios):
                        continue

                    weights = [1] * len(radios)
                    for key, strat in strategies.items():
                        if key in q_text:
                            w = strat["weights"]
                            weights = (w + [1] * len(radios))[:len(radios)]
                            break

                    choice = random.choices(radios, weights=weights, k=1)[0]
                    driver.execute_script("arguments[0].click();", choice)
                    time.sleep(0.1)
                    continue

                # ---------- 複選（不會全選） ----------
                checkboxes = q.find_elements(By.CSS_SELECTOR, 'div[role="checkbox"]')
                if checkboxes:
                    if any("true" in c.get_attribute("aria-checked") for c in checkboxes):
                        continue

                    weights = [1] * len(checkboxes)
                    k_min, k_max = 1, max(1, len(checkboxes) - 1)

                    for key, strat in strategies.items():
                        if key in q_text:
                            w = strat["weights"]
                            weights = (w + [1] * len(checkboxes))[:len(checkboxes)]
                            k_min, k_max = strat.get(
                                "k_range",
                                (1, max(1, len(checkboxes) - 1))
                            )
                            break

                    max_limit = max(1, len(checkboxes) // 2)
                    num_to_click = random.randint(
                        k_min,
                        min(k_max, max_limit)
                    )

                    if num_to_click >= len(checkboxes):
                        num_to_click = len(checkboxes) - 1

                    pool = []
                    for idx, w in enumerate(weights):
                        pool.extend([idx] * w)

                    selected = set()
                    while len(selected) < num_to_click and pool:
                        selected.add(random.choice(pool))

                    for idx in selected:
                        driver.execute_script(
                            "arguments[0].click();",
                            checkboxes[idx]
                        )
                        time.sleep(0.1)

                    continue

                # ---------- 文字題：完全不處理 ----------
                # 故意留空

            # ---------- 按鈕 ----------
            buttons = driver.find_elements(By.CSS_SELECTOR, 'div[role="button"]')
            next_btn = submit_btn = None

            for b in buttons:
                t = b.text
                if "提交" in t or "Submit" in t:
                    submit_btn = b
                elif "下一步" in t or "Next" in t or "繼續" in t:
                    next_btn = b

            if submit_btn:
                submit_btn.click()
                time.sleep(3)
                break
            elif next_btn:
                next_btn.click()
                time.sleep(1)
            else:
                break

        except Exception as e:
            print("錯誤：", e)
            break

def main():
    driver = get_driver()
    try:
        for i in range(TEST_COUNT):
            print(f"第 {i+1} 次填寫")
            fill_google_form_smart(driver)

            try:
                links = driver.find_elements(By.TAG_NAME, "a")
                for l in links:
                    if "提交其他回應" in l.text or "Submit another response" in l.text:
                        l.click()
                        break
                else:
                    driver.get(FORM_URL)
            except:
                driver.get(FORM_URL)

            time.sleep(2)
    finally:
        driver.quit()
        print("完成")

if __name__ == "__main__":
    main()
