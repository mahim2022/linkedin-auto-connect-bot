# linkedin-auto-connect-bot


ALL Countries URN
Country | URN
Middle East: | 
Saudi Arabia | 104104294
United Arab Emirates | 104577303
Qatar | 104385080
Kuwait | 104444320
Oman | 104693460
Bahrain | 104325490
Malaysia | 104805365
Japan | 105720785
South Korea | 104915796
Europe: | 
United Kingdom | 102221843
Germany | 101282230
France | 101620260
Netherlands | 102890719
Spain | 105646813
Italy | 103350119
Switzerland | 104034560
Sweden | 102879759
Belgium | 102872252
Australia | 101452733
Canada | 101174742


LinkedIn Automation Bot

This is a **LinkedIn connection bot** built using **Node.js** and **Playwright**. It automates the process of sending connection requests to people based on a **search keyword** and **location**.

 🛠️ Requirements

1. **Node.js** (v18 or later)
2. **Playwright** for browser automation
3. **GitHub Actions** (optional, for automated deployment)



 🧑‍💻 Setup

 1. Clone the Repo
```bash
git clone https://github.com/your-username/linkedin-bot.git
cd linkedin-bot
```

 2. Install Dependencies
```bash
npm install
```

 3. Create `.env` File
Create a `.env` file in the root of the project with the following variables:
```env
SEARCH_KEYWORD=software engineer
SEARCH_LOCATION_URN=102713980  # Example: 102713980 for India
MESSAGE=Hi, I’d love to connect and learn more about your work!
```

---

 🔑 Save Cookies (One-Time Setup)

Before the bot can run, you'll need to log in to LinkedIn manually and save the session cookies. This prevents the need to hardcode your credentials.

Run this one-time script:
```bash
node scripts/save-cookies.js
```
- The script will open a browser window for you to log in manually.
- After logging in, press **ENTER** in the terminal to save your cookies to `data/cookies.json`.

---

 🤖 Running the Bot

After setting up your `.env` and saving cookies, you can run the bot using:

```bash
node scripts/connect.js
```

The bot will:
- Navigate to the LinkedIn search results based on your specified **keyword** and **location**.
- Loop through profiles and send **connection requests** (with or without a message).

---

 🚀 GitHub Actions

To automate the bot on GitHub, set up **GitHub Actions** by following these steps:

1. **Create your repository on GitHub**.
2. Add the `.env` variables as **GitHub Secrets** (for security).
3. Push your code and set up a workflow in `.github/workflows/run-bot.yml`.

Example workflow:
```yaml
name: LinkedIn Bot

on:
  schedule:
    - cron: '0 10 * * *'  # Run every day at 10:00 UTC
  workflow_dispatch:  # Trigger manually if needed

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Create .env file
        run: |
          echo "SEARCH_KEYWORD=software engineer" >> .env
          echo "SEARCH_LOCATION_URN=102713980" >> .env
          echo "MESSAGE=Hi, would love to connect!" >> .env
      - name: Run bot
        run: node scripts/connect.js
        env:
          SEARCH_KEYWORD: ${{ secrets.SEARCH_KEYWORD }}
          SEARCH_LOCATION_URN: ${{ secrets.SEARCH_LOCATION_URN }}
          MESSAGE: ${{ secrets.MESSAGE }}
```

---

 📄 Notes:
- **Rate Limiting**: To avoid LinkedIn blocks, the bot includes delays between actions, randomized to simulate human-like behavior.
- **Browser Automation**: The bot uses Playwright, which runs **headless** (no UI).
- **Cookies**: Store cookies in `data/cookies.json` to avoid logging in every time.

---

 🛑 Limitations & Warnings
- **LinkedIn Detection**: While Playwright offers anti-detection features, LinkedIn may still flag or block accounts for unusual activity.
- **Usage**: Use the bot responsibly to avoid violating LinkedIn's terms of service.

---

 ⚡ Future Improvements
- **Proxy Support**: Add proxy handling to avoid IP bans.
- **Captcha Handling**: Integrate a captcha-solving service (like 2Captcha) for seamless usage.
- **Advanced Filtering**: Add more filters for connections, e.g., by industry, current company, etc.

---

 🤝 Contributing
Feel free to fork and contribute to this project! Open an issue or make a pull request for any improvements.

---

 👨‍💻 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

