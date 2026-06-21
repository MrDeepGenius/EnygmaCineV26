# Logo Display Fix - Hero Banner

## Problem
Logos were not displaying in the hero banner even though:
- The Banner component was ready to display them
- The frontend was passing `logoUrl` correctly
- The Movie interface had the `logoUrl` property defined

**Root Cause:** When admin posted banner/top10 items to the API, the items didn't include `logoUrl` because:
1. Items were selected from the local catalog which doesn't have logo data
2. The admin attempted to fetch logos on the frontend, but the API call wasn't working properly
3. Items were saved to config WITHOUT logos

## Solution
**Server-side logo auto-enrichment:** Modified the `POST /admin/config` endpoint to automatically fetch and add logos to any banner/top10 items missing them.

### Changes Made

#### File: `artifacts/api-server/src/routes/admin.ts`

Modified the `router.post("/admin/config", ...)` endpoint to:
1. Check if banner items are missing `logoUrl`
2. For each item missing a logo, call `getLogoUrl(itemId, itemType)` from TMDB
3. Add the fetched logo URL to the item before saving
4. Do the same for top10 items
5. Save the enriched config to disk

**Code added:**
```typescript
router.post("/admin/config", async (req, res): Promise<void> => {
  try {
    console.log("📝 Admin config POST received:", JSON.stringify(req.body, null, 2).substring(0, 500));
    
    // Enrich banner items with logos if missing
    const config = req.body;
    
    // Process banner items
    if (config.banner && config.banner.items && Array.isArray(config.banner.items)) {
      for (const item of config.banner.items) {
        if (!item.logoUrl && item.id) {
          console.log(`🎬 Fetching logo for banner item: ${item.titulo} (${item.id})`);
          const logoUrl = await getLogoUrl(item.id, item.tipo === "serie" || item.tipo === "anime" ? "tv" : "movie").catch(() => null);
          if (logoUrl) {
            item.logoUrl = logoUrl;
            console.log(`✅ Logo found for ${item.titulo}: ${logoUrl}`);
          } else {
            console.log(`⚠️ No logo found for ${item.titulo}`);
          }
        }
      }
    }

    // Process top10 items
    if (config.top10 && config.top10.items && Array.isArray(config.top10.items)) {
      for (const item of config.top10.items) {
        if (!item.logoUrl && item.id) {
          console.log(`🎬 Fetching logo for top10 item: ${item.titulo} (${item.id})`);
          const logoUrl = await getLogoUrl(item.id, item.tipo === "serie" || item.tipo === "anime" ? "tv" : "movie").catch(() => null);
          if (logoUrl) {
            item.logoUrl = logoUrl;
            console.log(`✅ Logo found for ${item.titulo}: ${logoUrl}`);
          } else {
            console.log(`⚠️ No logo found for ${item.titulo}`);
          }
        }
      }
    }

    writeConfig(config);
    console.log("✅ Admin config saved successfully with logos");
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error saving admin config:", e);
    res.status(500).json({ error: String(e) });
  }
});
```

## How It Works

### Flow Diagram
```
Admin adds/edits banner items
         ↓
Frontend sends POST /admin/config
         ↓
Backend receives config
         ↓
Checks each banner/top10 item for missing logoUrl
         ↓
For each missing logo:
  - Calls getLogoUrl(itemId, itemType)
  - Fetches from TMDB API
  - Adds logoUrl to item
         ↓
Saves enriched config to disk
         ↓
Response sent to frontend
         ↓
Frontend receives confirmation
         ↓
Home.tsx fetches config & passes to Banner
         ↓
Banner displays logos in hero
```

### Data Flow

1. **Admin Panel** (`artifacts/enygma/src/pages/admin.tsx`)
   - User searches and selects banner item from local catalog
   - Item has: `id`, `titulo`, `tipo`, `posterUrl`, `backdropUrl`, `overview`, `year`
   - Item does NOT have `logoUrl` (not in local catalog)
   - User clicks "Guardar" → POST `/admin/config`

2. **API Server** (`artifacts/api-server/src/routes/admin.ts`)
   - Receives config with banner items
   - Iterates through each banner item
   - If missing `logoUrl`:
     - Calls `getLogoUrl(itemId, "movie"|"tv")`
     - Uses TMDB API to fetch logo (Spanish or English preferred)
     - Adds to item: `logoUrl: "https://image.tmdb.org/t/p/original/..."`
   - Saves enriched config to `data/admin-config.json`
   - Logs success/failure for each item

3. **Frontend Home** (`artifacts/enygma/src/pages/home.tsx`)
   - Fetches config via `GET /admin/config`
   - Gets banner items WITH `logoUrl` now populated
   - Maps to Movie interface via `toRowItem()` function
   - Passes to Banner component

4. **Banner Component** (`artifacts/enygma/src/components/banner.tsx`)
   - Receives items with `logoUrl`
   - Displays logo if available: `{currentItem.logoUrl ? <img> : <title>}`
   - Shows in hero with proper styling and drop shadow

## Testing

### Test Case 1: Add New Banner Item
1. Go to Admin → Banner tab
2. Search for a movie (e.g., "Scary Movie")
3. Select it from results
4. Click "Añadir al Banner"
5. Click "Guardar"
6. **Expected:** Item appears in banner with logo on home page

### Test Case 2: Check Server Logs
1. Look at API server logs during save
2. **Expected logs:**
   ```
   🎬 Fetching logo for banner item: Scary Movie (1273221)
   ✅ Logo found for Scary Movie: https://image.tmdb.org/t/p/original/...
   ✅ Admin config saved successfully with logos
   ```

### Test Case 3: Verify Config File
1. Check `artifacts/api-server/data/admin-config.json`
2. Banner items should now have `logoUrl` field:
   ```json
   {
     "id": "1273221",
     "titulo": "Scary Movie",
     "tipo": "movie",
     "logoUrl": "https://image.tmdb.org/t/p/original/...",
     "backdropUrl": "...",
     "posterUrl": "..."
   }
   ```

### Test Case 4: Swipe Hero Banner
1. Go to home page
2. See hero banner with logo displayed
3. Swipe left/right on mobile or click dots
4. **Expected:** Hero changes to next item, logo updates automatically

### Test Case 5: Series/Anime Logos
1. Add a series or anime to banner
2. **Expected:** System correctly identifies as `"tv"` type and fetches from TMDB TV endpoint
3. Logos display correctly

## Files Modified

- **`artifacts/api-server/src/routes/admin.ts`**
  - Modified `router.post("/admin/config")` to auto-enrich logos
  - Made the endpoint async to support async logo fetching
  - Added logging for debugging

## Files Already Correct (No Changes Needed)

- **`artifacts/enygma/src/pages/admin.tsx`** ✓
  - Already sends config to backend

- **`artifacts/enygma/src/pages/home.tsx`** ✓
  - Already maps `logoUrl` via `toRowItem()`
  - Already fetches fresh config every 5 seconds for real-time updates

- **`artifacts/enygma/src/components/banner.tsx`** ✓
  - Already displays logo if available
  - Already handles swipe functionality

- **`lib/api-client-react/src/generated/api.schemas.ts`** ✓
  - Movie interface already has `logoUrl?: string | null`

## Deployment Notes

When deploying to Render:
1. Ensure `TMDB_API_KEY` environment variable is set
2. API server will auto-fetch logos on first config save after deployment
3. If logos don't appear immediately after first save, it's likely TMDB API is being rate-limited
4. Logos are cached in `admin-config.json` after first fetch
5. No database changes needed

## Troubleshooting

### Logos still not showing?
1. Check API server logs for logo fetch attempts
2. Verify TMDB API key is working
3. Try saving config again (force logo fetch)
4. Check browser DevTools network tab to ensure logoUrl is in API response

### Some items don't have logos?
- Not all TMDB items have logos (older content)
- System will skip missing logos and display title instead
- This is handled by Banner component: `{currentItem.logoUrl ? <img> : <title>}`

### Performance impact?
- Logo fetching happens during config save only (not on every page load)
- TMDB API calls are fast (typically <100ms per item)
- Logos are cached in JSON file after first fetch
- No performance impact on subsequent page loads

## Future Improvements

1. Add caching headers to prevent unnecessary TMDB API calls
2. Allow admin to override/replace logos manually
3. Batch logo fetching with Promise.all() for faster processing
4. Add retry logic for failed TMDB requests
5. Cache TMDB responses in Redis for faster subsequent fetches
