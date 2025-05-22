# South Manchester Darts Scorer

This is a simple darts scoring app built using **Laravel 12**, **Jetstream**, and **Vue 3**.

## 🧠 Purpose

Version 1 allows two players to play a single leg of 301 or 501 darts with real-time score tracking and burst logic.

## 🔧 Tech Stack

- Laravel 12
- Jetstream with Inertia + Vue
- Tailwind CSS
- MySQL
- Nginx (WSL dev) + GitHub for version control

## 🚀 Local Setup

```bash
git clone git@github.com:tony-fogarty/scorer.git
cd scorer
cp .env.example .env
composer install
npm install && npm run build
php artisan key:generate
php artisan migrate
php artisan serve
