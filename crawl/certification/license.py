import pandas as pd
from bs4 import BeautifulSoup
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def License(result):
    url = "https://www.pqi.or.kr/indexMain.do"

    options = Options()
    options.add_experimental_option("detach", True)    # 브라우저 꺼짐 방지 옵션
    service = Service()  # 크롬 드라이버 최신 버전 설정
    driver = webdriver.Chrome(service=service, options=options)  # 웹 브라우저 선택 및 설정

    driver.get(url)   # 해당 URL을 선택된 브라우저로 오픈
    driver.find_element(By.CSS_SELECTOR, "#gnb > ul > li.g2.depth0 > a").click()
    driver.find_element(By.CSS_SELECTOR, "#left_wrap > ul > li:nth-child(2) > ul > li:nth-child(2) > a").click()

    # 7페이지까지 반복
    for page_num in range(1, 8):
        try:
            # 현재 페이지에서 데이터 수집
            html = driver.page_source
            soupCB = BeautifulSoup(html, 'html.parser')

            # 테이블의 각 항목을 반복하여 데이터 수집
            for j in range(4, 10):
                try:
                    for i in range(1, 10):
                        try:
                            # driver.execute_script("detail('%d')" % i)
                            time.sleep(1)
                            html = driver.page_source
                            soupCB = BeautifulSoup(html, 'html.parser')
                            license_name_h1 = soupCB.select(
                                "#searchVO > article.content_result > table > tbody > tr:nth-child(%d) > td > a" % i)
                            license_name = license_name_h1[0].string
                            # print(license_name)

                            license_name_h2 = soupCB.select(
                                "#searchVO > article.content_result > table > tbody > tr:nth-child(%d) > td" % i)
                            license_name_h3 = license_name_h2[1].string
                            # print("발급기관:", license_name_h3)

                            result.append({"license": license_name, "organization": license_name_h3})

                            # 이걸 삭제하거나 주석처리하면 반복이 안됨.. 왜지
                            license_name_h1[2].string


                        except:
                            continue
                        return

                    driver.find_element(By.CSS_SELECTOR,"#searchVO > article.content_result > div.page_num.alignC > ul > li:nth-child(%d) > a"%j).click()


                except Exception as e:
                    print(f"Error at row {i}: {e}")
                    continue

        except Exception as e:
            print(f"Error navigating pages: {e}")
            break

    driver.quit()

def main():
    result = []
    print('License List crawling >>>>>>>>>>>>>>>>>>>>>>>>')
    License(result)

    # DataFrame 생성
    Lic_tbl = pd.DataFrame(result, columns=('license', 'organization'))
    Lic_tbl.to_csv('./Licns.csv', encoding='cp949', mode='w', index=False)
    print(Lic_tbl)

if __name__ == '__main__':
    main()
