@echo off
echo ============================================
echo SoleMate VN - Deploy Database via Supabase CLI
echo ============================================

echo.
echo Step 1: Login to Supabase...
supabase login

echo.
echo Step 2: Link to your Supabase project...
echo (You need your Project Reference ID from Supabase Dashboard -^> Settings -^> General)
set /p PROJECT_REF="Enter your Supabase Project Ref ID: "
supabase link --project-ref %PROJECT_REF%

echo.
echo Step 3: Push all migrations to remote database...
supabase db push

echo.
echo Step 4: Check migration status...
supabase migration list

echo.
echo ============================================
echo Database deployed successfully!
echo Next: Fill in your .env.local with Supabase credentials
echo Then run: npm run dev
echo ============================================
pause
