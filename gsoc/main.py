import requests
import json 

cookies = {
    '_gid': 'GA1.3.804641029.1779978064',
    '_gat_gtag_UA_53341410_23': '1',
    '_ga': 'GA1.1.1543515242.1779978064',
    '_ga_KTPNKLMCZ6': 'GS2.1.s1779978063$o1$g1$t1779978136$j59$l0$h0',
}

headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=1, i',
    'referer': 'https://summerofcode.withgoogle.com/programs/2026/organizations',
    'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    # 'cookie': '_gid=GA1.3.804641029.1779978064; _gat_gtag_UA_53341410_23=1; _ga=GA1.1.1543515242.1779978064; _ga_KTPNKLMCZ6=GS2.1.s1779978063$o1$g1$t1779978136$j59$l0$h0',
}

response = requests.get('https://summerofcode.withgoogle.com/api/program/2026/organizations/', cookies=cookies, headers=headers)

with open('data.json', 'w') as f:
    json.dump(response.json(), f, indent=4)