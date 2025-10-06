# 🍽️ Smart Meal Grouping Feature

## ✨ **Feature Overview**

When you log multiple parts of the same meal within **5 minutes**, they are now **automatically grouped together** and displayed as one combined entry! Perfect for when you log your dinner in parts (like dal + rice, then curd, then bhaji).

---

## 🎯 **Problem Solved**

### **Before:**
Your dinner logged at 11:30 PM showed as **3 separate entries**:
1. ❌ DINNER - 11:30 PM - Half bhakri and bhaji, fried bhaji
2. ❌ DINNER - 11:30 PM - 1 bowl curd
3. ❌ DINNER - 11:30 PM - dal + rice

### **After:**
Now they show as **1 combined entry**:
✅ **DINNER - 11:30 PM** `3 entries combined`
- Half bhakri and bhaji
- fried bhaji
- 1 bowl curd
- dal + rice

---

## 🔧 **How It Works**

### **Smart Grouping Algorithm:**

1. **Analyzes all meals** logged on the same date
2. **Groups meals** that match:
   - ✅ **Same meal type** (Breakfast, Lunch, Dinner, Snacks)
   - ✅ **Within 5 minutes** of each other
3. **Combines descriptions** from all entries
4. **Displays as single card** with combined badge

### **Technical Details:**

```typescript
// Grouping Logic
const TIME_WINDOW = 5; // minutes

// Checks:
1. Same meal type? ✓
2. Time difference ≤ 5 minutes? ✓
3. → Combine into one group!
```

---

## 📱 **User Interface**

### **Grouped Entry Display:**

```
┌─────────────────────────────────────────────────┐
│ DINNER 🍕 ⭐ 3 entries combined        11:30 PM │
│                                                  │
│ ┌──────────────┐ ┌──────────────┐              │
│ │ dal + rice   │ │ 1 bowl curd  │              │
│ └──────────────┘ └──────────────┘              │
│ ┌──────────────────────────────┐               │
│ │ Half bhakri and bhaji        │               │
│ └──────────────────────────────┘               │
│                                                  │
│ ───────────────────────────────────────────── │
│ Individual entries:                             │
│ #1 dal + rice                     11:30 PM 🗑️  │
│ #2 1 bowl curd                    11:30 PM 🗑️  │
│ #3 Half bhakri and bhaji          11:30 PM 🗑️  │
└─────────────────────────────────────────────────┘
```

### **Features:**
- ✅ **Combined badge** shows number of entries
- ✅ **All food items** displayed as chips
- ✅ **Expandable section** shows individual entries
- ✅ **Individual delete buttons** for each sub-entry
- ✅ **Individual edit buttons** for each sub-entry
- ✅ **Single time display** (earliest entry time)

---

## 🎨 **Visual Indicators**

### **Grouped Entry Badge:**
```
⭐ 3 entries combined
```
- **Green badge** appears when entries are grouped
- Shows **count** of combined entries
- Makes it clear this is a grouped view

### **Individual Entries Section:**
- **Collapsible section** at the bottom
- **List of sub-entries** with timestamps
- **Edit/Delete buttons** for each
- **Numbered** for easy reference (#1, #2, #3)

---

## 🔍 **Examples**

### **Example 1: Dinner in 3 Parts**
**Logged:**
- 11:30 PM: dal + rice
- 11:30 PM: 1 bowl curd
- 11:32 PM: Half bhakri and bhaji

**Result:** ✅ **1 grouped entry** (within 5 minutes)

---

### **Example 2: Lunch (Not Grouped)**
**Logged:**
- 1:45 PM: 2 chapati + bhaji
- 2:00 PM: 1 samosa paw

**Result:** ✅ **2 separate entries** (15 minutes apart, exceeds 5-minute window)

---

### **Example 3: Breakfast (Not Grouped - Different Type)**
**Logged:**
- 10:30 AM: Tea with biscuits (Breakfast)
- 10:32 AM: Coffee (Snacks)

**Result:** ✅ **2 separate entries** (different meal types)

---

## ⚙️ **Settings**

### **Time Window:**
- **Current:** 5 minutes
- **Configurable:** Can be changed in the code
- **Location:** `History.tsx` → `groupNearbyMeals()` → `TIME_WINDOW`

```typescript
const TIME_WINDOW = 5; // Change to 10 for 10-minute window
```

---

## 🛠️ **Technical Implementation**

### **Files Modified:**
**`src/components/History.tsx`**

### **New Function Added:**
```typescript
groupNearbyMeals(mealList: MealEntry[]) {
  // 1. Sort meals by timestamp
  // 2. Iterate through meals
  // 3. Check if meal can join existing group
  //    - Same meal type?
  //    - Within TIME_WINDOW minutes?
  // 4. If yes: add to group
  //    If no: create new group
  // 5. Return grouped meals
}
```

### **Key Features:**
- ✅ **Time-based grouping** (5-minute window)
- ✅ **Type-based grouping** (same meal type only)
- ✅ **Description combining** (comma-separated)
- ✅ **Flag preservation** (cheat meal, tea)
- ✅ **Individual entry tracking** (for edit/delete)

---

## 📊 **Benefits**

### **For You:**
1. ✅ **Cleaner view** - No more repeated entries
2. ✅ **Complete picture** - See all parts of a meal together
3. ✅ **Easy management** - Still edit/delete individual items
4. ✅ **Better organization** - Logical meal grouping

### **For Data:**
1. ✅ **Accurate logging** - Each item still tracked separately
2. ✅ **Better analytics** - Clear meal patterns
3. ✅ **Flexible editing** - Modify any part
4. ✅ **Smart display** - Group only when it makes sense

---

## 🎯 **Use Cases**

### **Perfect For:**
- 🍽️ **Multi-course meals** (dal, rice, curd, bhaji)
- ☕ **Snacks logged separately** (tea, then biscuits)
- 🍕 **Cheat meals** (pizza, then dessert)
- 🥗 **Salad components** (vegetables, dressing, nuts)

### **Won't Group:**
- ❌ Different meal types (Breakfast vs Snacks)
- ❌ Entries more than 5 minutes apart
- ❌ Entries on different dates
- ❌ Different times of day

---

## 💡 **Tips**

### **For Best Results:**
1. **Log related items quickly** (within 5 minutes)
2. **Use same meal type** for items eaten together
3. **Check grouped view** to verify all items are included
4. **Edit individual entries** if something is wrong

### **If You Want Separate Entries:**
1. **Wait 6+ minutes** before logging next item
2. **Use different meal type** (change from Dinner to Snacks)
3. **Delete and re-log** with time difference

---

## 🎊 **Final Status**

### **✅ FULLY IMPLEMENTED**

All grouping features working:
- ✅ Smart time-based grouping (5 minutes)
- ✅ Type-based grouping (same meal type)
- ✅ Combined description display
- ✅ Group badge indicator
- ✅ Individual entries section
- ✅ Edit/delete for each sub-entry
- ✅ Visual distinction for grouped entries
- ✅ Preserves cheat meal and tea flags

**Your meal logging is now smarter and cleaner! 🍽️✨**

---

## 📌 **Quick Reference**

| Feature | Status | Details |
|---------|--------|---------|
| **Time Window** | ✅ 5 minutes | Configurable |
| **Grouping Criteria** | ✅ Type + Time | Same meal type within window |
| **Visual Indicator** | ✅ Green badge | Shows count |
| **Individual Access** | ✅ Full control | Edit/delete each entry |
| **Description Display** | ✅ All items | Comma-separated chips |
| **Expandable Details** | ✅ Collapsible | Shows all sub-entries |

**Enjoy your cleaner, smarter meal history! 🎉**
