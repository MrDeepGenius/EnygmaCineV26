# Logo Fix - Testing Guide 📸

## Status: ✅ IMPLEMENTED AND RUNNING

Both servers are currently running:
- Frontend: http://192.168.100.24:20693
- API Server: Port 8000

---

## Quick Test (2 minutes)

### Step 1: Open Admin Panel
Open this URL in your browser:
```
http://192.168.100.24:20693/admin
```

### Step 2: Add a Banner Item
1. Click the **"Banner"** tab
2. In the search box, type a movie name like:
   - "Scary Movie"
   - "Avatar"
   - "Toy Story"
   - "The Matrix"
3. Click on the movie from the results
4. You should see the item details appear
5. Click **"Añadir al Banner"** button

### Step 3: Save Config
Click the **"Guardar"** (Save) button at the top

### Step 4: Check for Logo Fetch
Open API server console/logs and look for these messages:
```
🎬 Fetching logo for banner item: Scary Movie (1273221)
✅ Logo found for Scary Movie: https://image.tmdb.org/t/p/original/...
✅ Admin config saved successfully with logos
```

**Success** ✅ if you see these messages

### Step 5: View Home Page
Go to: `http://192.168.100.24:20693`

You should see:
- Hero banner with **LOGO displayed** prominently
- Title (fallback if no logo)
- Year + Rating
- Synopsis below
- Pagination dots at bottom

---

## Detailed Testing

### Test A: Logo Display
**Expected Result:** Logo shows on hero banner

**Steps:**
1. Add item to banner (follow Quick Test above)
2. Go to home page
3. Look at hero banner
4. **Should see:** Big logo image from TMDB
5. **If not:** Try refreshing page or clicking "Guardar" again

**Troubleshooting:**
- Refresh page with Ctrl+Shift+R (hard refresh)
- Check browser DevTools Network tab
- Look for `/api/admin/config` response
- Should have `logoUrl` field in banner items

### Test B: Swipe Navigation
**Expected Result:** Hero changes when you swipe

**Steps:**
1. Add at least 2 movies to banner
2. Go to home page
3. On mobile: Swipe left/right on banner
4. On desktop: Click pagination dots at bottom
5. **Should see:** Hero changes to next item with new logo

**Expected Behavior:**
- Smooth fade animation
- Logo updates immediately
- Pagination dot highlights correct item

### Test C: Series/Anime Support
**Expected Result:** Logos work for TV content

**Steps:**
1. Go to Admin → Banner tab
2. Search for a TV series name:
   - "Breaking Bad"
   - "Game of Thrones"
   - "The Office"
3. Select it from results
4. Click "Añadir al Banner"
5. Click "Guardar"
6. Go to home page
7. **Should see:** Series logo displayed

**API logs should show:**
```
🎬 Fetching logo for banner item: Breaking Bad (1396)
✅ Logo found for Breaking Bad: https://image.tmdb.org/t/p/original/...
```

### Test D: Top 10 Logos
**Expected Result:** Top 10 section also shows logos

**Steps:**
1. Go to Admin → Top 10 tab
2. Search for a movie
3. Select it
4. Click "Añadir al Top 10"
5. Click "Guardar"
6. Go to home page
7. Scroll to "Top 10 en ENYGMA" section
8. **Should see:** Items with logos and numbers

### Test E: Real-time Updates
**Expected Result:** Changes appear automatically

**Steps:**
1. Open home page in one window
2. Open admin in another window
3. Add an item to banner and save
4. Switch back to home page
5. **Should see:** New item appears within 5 seconds
6. **Should have:** Logo already loaded

---

## Visual Checklist

### Hero Banner Should Show:
```
[Hero Backdrop Image]
[      Logo Image       ]  ← THIS IS NEW (the fix!)
     Rating Year        ← Should be visible
     Synopsis Text      ← Should be visible
   [●] ○ ○ ○ ○         ← Pagination dots
```

### What Logos Look Like
- White or colored logo on transparent background
- From official TMDB library
- Examples:
  - Movie logos: Title in stylized font
  - Studio logos: Company branding
  - Show logos: Series title with style

### What NOT to See
❌ Broken image icon
❌ Title text instead of logo
❌ Empty space where logo should be
❌ Console errors

---

## Configuration File Check

To verify logos are saved:

1. Open this file in a text editor:
   ```
   artifacts/api-server/data/admin-config.json
   ```

2. Look for `banner` section:
   ```json
   {
     "banner": {
       "override": true,
       "items": [
         {
           "id": "1273221",
           "titulo": "Scary Movie",
           "tipo": "movie",
           "posterUrl": "...",
           "backdropUrl": "...",
           "logoUrl": "https://image.tmdb.org/t/p/original/...",  ← THIS FIELD!
           "overview": "..."
         }
       ]
     }
   }
   ```

3. **Success** ✅ if you see `logoUrl` fields with URLs

---

## Common Issues & Fixes

### Issue: Logos Not Showing
**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Go back to admin and click "Guardar" again
4. Wait 5 seconds for real-time update

### Issue: Swipe Not Working
**Solution:**
1. Add more items first (need at least 2 for swipe)
2. Try clicking pagination dots instead
3. Check console for errors: F12 → Console tab
4. Try on mobile device if testing on desktop

### Issue: API Connection Error
**Solution:**
1. Check both servers are running
2. Try accessing API directly: `http://localhost:8000/api/admin/config`
3. Restart API server if needed
4. Check firewall isn't blocking port 8000

### Issue: Logos Say "Not Found"
**Solution:**
1. TMDB might not have logos for that item (rare)
2. Try different movie
3. Check API logs for TMDB error messages
4. Fallback to title display works fine

---

## What Each Component Does

### 🎬 Admin Panel (`/admin`)
- You search for movies/series/anime
- You select and add to banner
- You click "Guardar"

### 🔧 API Server (Backend)
- Receives your config
- **NEW:** Auto-fetches logos from TMDB
- Saves enriched config to JSON file
- Returns success response

### 🏠 Home Page (`/`)
- Loads config from API
- Gets items WITH logos included
- Displays banner with logo
- Handles swipe/pagination

### 🎨 Banner Component (UI)
- Renders logo if available
- Shows fallback title if no logo
- Handles swipe gestures
- Animates between items

---

## Success Indicators

You'll know the fix is working when:

1. ✅ Admin saves without errors
2. ✅ API logs show logo fetch messages
3. ✅ Config file has `logoUrl` fields
4. ✅ Home page displays logo (not title)
5. ✅ Logo appears on first load (no waiting)
6. ✅ Swipe changes both item AND logo
7. ✅ Mobile swipe works smoothly
8. ✅ Series/anime have logos too
9. ✅ Page refresh keeps logos
10. ✅ No console errors in DevTools

---

## Performance Notes

The fix is **very fast** because:
- Logo fetching happens only during admin save
- Not on every page load
- TMDB API is fast (~100ms per logo)
- Results are cached in JSON file
- Subsequent loads: instant

---

## Example: Complete Test Flow

### Setup
- Open http://192.168.100.24:20693 (home page)
- Open http://192.168.100.24:20693/admin in another tab
- Open API server logs in console

### Steps
1. Go to Admin tab
2. Click "Banner" 
3. Search "Avatar"
4. Click on result
5. Click "Añadir al Banner"
6. Click "Guardar"
7. Watch console for: ✅ Logo found
8. Go to home tab
9. Refresh page
10. See logo on hero banner ✅

### Success
- Logo displays
- No errors
- Can swipe between items
- New items show up in real-time
- Config file has logoUrl

---

## Need Help?

- Check `SOLUTION_SUMMARY.md` for technical details
- Check `LOGO_FIX.md` for implementation details
- Review `NEXT_STEPS.md` for deployment info

All files are in the project root directory.
