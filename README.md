# Assessment Hall

A multi-teacher online quiz portal: teacher accounts, AI-free doc-style question import,
per-student shuffled questions/options, a countdown timer, full-screen enforcement, and
tab-switch / copy / inspect deterrents. Built with React + Vite, hosted on Firebase
(Auth + Firestore + Hosting), deployed from GitHub.

## Important limits, read first

- **Full-screen** only launches on the student's "Start test" click (browsers block
  auto-fullscreen without a user gesture — there's no way around this from a webpage).
  If they exit full screen mid-test, it's logged as a flag and they're prompted back in.
- **Inspect/copy blocking is a deterrent, not a lock.** No website can truly disable
  browser dev tools or stop OS-level screenshots. This blocks right-click, common
  dev-tools shortcuts, and text copying, and logs attempts — but a determined student
  with local admin access can always get around client-side restrictions. Treat this as
  raising friction, not as secure proctoring.

## 1. Create your Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it anything.
2. In the project, go to **Build → Authentication → Get started** → enable **Email/Password**.
3. Go to **Build → Firestore Database → Create database** → start in **production mode**.
4. Go to **Project settings (gear icon) → General → Your apps → Add app → Web**.
   Copy the `firebaseConfig` values shown — you'll need all six for step 3 below.
5. In **Project settings → Service accounts**, click **Generate new private key** —
   this downloads a JSON file. You'll paste its full contents into GitHub in step 4.

## 2. Push this project to GitHub

```bash
cd quiz-portal
git init
git add .
git commit -m "Initial commit"
gh repo create assessment-hall --public --source=. --push
# or create the repo on github.com and:
# git remote add origin https://github.com/<you>/assessment-hall.git
# git push -u origin main
```

## 3. Add GitHub Actions secrets

In your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**,
add each of these (values from step 1.4):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT` — paste the **entire contents** of the JSON file from step 1.5

## 4. Deploy Firestore security rules (one-time, from your machine)

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # pick your project, give it alias "default"
firebase deploy --only firestore:rules
```

## 5. Deploy the app

Push to `main` — the included GitHub Actions workflow (`.github/workflows/deploy.yml`)
builds the app and deploys it to Firebase Hosting automatically. After the first run,
find your live URL in the Firebase Console under **Hosting**, or in the Action's log output.

## 6. Try it

- Open the live URL → **Create one** (signup) as a teacher.
- **New quiz** → paste questions in this format (blank line between questions):

  ```
  1. What is the capital of France?
  A) Berlin
  B) Madrid
  C) Paris
  D) Rome
  Answer: C
  ```

- Extract → review → publish → note the 6-character code.
- Open the same live URL in an incognito window (or send it to a student) →
  **Joining a test as a student instead?** → enter name + code → Start test.
- Watch results land live on your dashboard as students submit.

## Local development

```bash
npm install
cp .env.example .env   # fill in your Firebase config values
npm run dev
```

## Project layout

```
src/
  firebase.js           Firebase init (reads env vars)
  contexts/AuthContext   Teacher login/signup/session
  utils/parseQuestions   Structured-text → question parser (no AI/API key needed)
  utils/shuffle          Seeded per-student shuffle, code generator
  utils/useLockdown      Full-screen, tab-switch, copy/inspect deterrents
  pages/                 Login, Signup, Dashboard, CreateQuiz, QuizResults,
                          StudentJoin, TakeQuiz, StudentResult
```
