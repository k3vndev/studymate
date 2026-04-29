# Studymate

A modern web app designed to enhance self-learning with AI.

Create, follow, and complete Studyplans, track your progress, earn achievements to flex on your profile, and chat with Mate — your virtual assistant.

🚀 Built with **Next.js, TypeScript, Zustand, Supabase, Zod, and TailwindCSS**

## 💻 Features

### Dashboard

Your entry point after logging in.

* View your current Studyplan
* Start a new one
* Chat with Mate instantly

If no Studyplan is selected, Mate greets you and suggests options.
You can also browse and save Studyplans for later.

![Dashboard preview](/public/screenshots/dashboard.webp)

### Chat

Here you will be interacting with Mate, your helpful and friendly virtual assistant   👾

* Generate new Studyplans
* Get help with tasks
* Ask for explanations or study tips
* Track your progress in real time

Mate knows your current Studyplan, which day you're on, and your progress. Feel free to ask how to continue or complete tasks 🪄

![Chat preview](/public/screenshots/chat.webp)

### 📚 Studyplan

The core of Studymate. Start, manage, and complete your Studyplans here.

There's a card for the current day's lesson, and a list of all the lessons and tasks of the Studyplan regardless of the day so you know what's to come.

![Studyplan preview](/public/screenshots/studyplan.webp)

> 📜 You can create new Studyplans via chat or select existing ones from the dashboard.

### Studyplan Tasks

Your daily execution layer.

* View the day’s goal
* Complete structured tasks
* Ask Mate for help or hints

Finish all tasks → get rewarded → rest guilt-free 🎉

![Tasks preview](/public/screenshots/studyplan-tasks.webp)

> 🎯 Access via the “Today’s Lesson” card in the Studyplan page.

### Focus Mode

Designed for deep work.

* Built-in timer
* Task list for the day
* Quick task switching

Stay locked in. No excuses.

![Focus preview](/public/screenshots/focus.webp)

### Profile

Track your grind. Build streaks. Flex consistency.

* Stats & progress
* Achievements & trophies 🏆
* Saved & completed Studyplans


![Profile preview](/public/screenshots/profile.webp)


## ⚙️ How It Works

### Studyplans Lifecycle

1. **Created privately** inside your chat with Mate
2. **Saved or started → becomes public (anonymously)**
3. Other users can **discover it in their dashboards**
4. Starting a Studyplan creates a **personal copy**

> Studymate is **not a social network** — interaction is indirect via shared Studyplans.


## 🛠️ Local Setup

To run locally, you’ll need:

* A **Supabase instance**
* An **OpenAI API key**

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment file

```bash
cp .env.example .env.local
# or on Windows:
Copy-Item .env.example .env.local
```

### 3. Fill in your keys

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
```

### 4. Start the dev server

```bash
pnpm dev
```

## 🚧 Roadmap

Studymate is actively evolving.

📃 Planned features include:
- User profiles [✓]
- Achievements [Postponed]
- Streak tracking [✓]
- Study statistics [✓]
- Chat messages deletion and editing
- Mate responses streaming [✓]
- Max days for Studyplans increase [✓]
- Studyplans browsing

...and more cool stuff along the way.

## 🙌 Special Thanks

* [Tabler Icons](https://tabler.io/icons)
* [Heroicons](https://heroicons.com)
* Mate (obviously)
