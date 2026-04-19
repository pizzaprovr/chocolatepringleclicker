# Chocolate Pringles Clicker

A small clicker game about chocolate-covered Pringles.

## Play

Open `index.html` in a browser and click the snack.

## Windows exe

Open `dist/ChocolatePringlesClicker.exe` to launch the game on Windows.

The Windows build uses WebView2 so it opens in its own app window instead of launching Chrome.

Keep these files together:

- `ChocolatePringlesClicker.exe`
- `Microsoft.Web.WebView2.Core.dll`
- `Microsoft.Web.WebView2.WinForms.dll`

## Online leaderboard

The `OnlineServer` folder contains a small Node server for shared accounts and leaderboard scores.

Run it locally:

```powershell
cd ChocolatePringlesClicker\OnlineServer
npm start
```

Then open:

```text
http://localhost:3000
```

To make it online for other players, host the `OnlineServer` folder on a Node hosting service and share that hosted URL.

## Rules

- The first 1000 clicks cover the Pringle in chocolate.
- Ranks start after the Pringle is fully chocolate.
- Each color tier lasts 1000 clicks and is split into rank 1, 2, and 3.
- Pro has infinite numbered ranks.
- Boosts: Bronze +5, Silver +10, Gold +20, Platinum +30, Diamond +40, Mythic +50, Exotic +60, Legendary +70, Masters +90, Pro +10.
- Pro always gives +10 per click, so Pro ranks are slower to grind.
- The chocolate color changes to match your rank.
- Pets pop out of the walls and give compliments.
