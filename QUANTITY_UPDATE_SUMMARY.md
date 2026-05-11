# GoRent - Multiple Item Quantities Feature Update

## Overview
Updated the GoRent rental system to allow users to order **multiple quantities** of each item instead of just selecting single items.

## Changes Made

### 1. **HTML Changes** (`index.html`)
- **Removed**: Checkbox-based item selection (limited to 4 items max)
- **Added**: Number input fields for each item with quantity selection
  - Each item now has a quantity input field (0-99 range)
  - Users can enter any quantity they need
  - Display shows item name, price per unit, and quantity input side-by-side

**New Item List with Quantities:**
- Camera: Rp 75.000 × Qty
- Projector: Rp 100.000 × Qty
- Handie Talkie: Rp 10.000 × Qty
- Screen proyektor: Rp 50.000 × Qty
- Stabilizer DJI RS 3 mini: Rp 200.000 × Qty

### 2. **JavaScript Changes** (`script.js`)

#### Variable Updates
- Replaced `checkboxes` selector with `quantityInputs` selector
- Now targets `.item-quantity` elements instead of `.item-checkbox`

#### Price Calculation (`updatePriceDisplay()`)
**Before:**
- Only calculated price for selected checkboxes (1 unit each)
- Price = (sum of item prices) × days

**After:**
- Calculates price considering quantities
- Price = (sum of item_price × quantity) × days
- Displays items as "Camera (2x), Handie Talkie (10x)" format

**Example:**
- 2× Camera (Rp 75.000) + 10× Handie Talkie (Rp 10.000) = Rp 250.000/day
- For 5 days: Rp 250.000 × 5 = Rp 1.250.000 total

#### Item Selection Handler
- Removed checkbox validation (max 4 items)
- Added quantity input listeners:
  - `change` event: validates ranges and updates display
  - `input` event: real-time price updates as user types
  - Validation: quantity must be 0-99

#### Form Submission
- **Before**: Collected selected items as array of names
- **After**: Builds detailed item structure with quantities
  - Each selected item includes: `name`, `qty`, `price`
  - Creates readable description: "Camera x2, Handie Talkie x10"
  - Stores in `item_1` field as concatenated string

**Price Calculation in Submission:**
```javascript
let pricePerDay = 0;
selectedItems.forEach(item => {
  pricePerDay += item.price * item.qty;  // price × quantity
});
const totalPrice = pricePerDay * totalDays;
```

## User Experience

### Before:
```
☐ Camera          Rp 75.000
☐ Projector       Rp 100.000
☐ Handie Talkie   Rp 10.000
(Max 4 items selectable)
```

### After:
```
Camera            Rp 75.000    [__2__]
Projector         Rp 100.000   [__1__]
Handie Talkie     Rp 10.000    [_10__]
(Unlimited quantities, 0-99 each)

Price Display:
Dipilih: Camera (2x), Projector (1x), Handie Talkie (10x)
Harga per Hari: Rp 300.000
Jumlah Hari: 5 hari
Total Harga: Rp 1.500.000
```

## Database Storage

Items are stored in the `item_1` field as a concatenated string:
```
"Camera x2, Projector x1, Handie Talkie x10"
```

This format:
- ✅ Easy to read in admin panel
- ✅ Backwards compatible (no schema changes needed)
- ✅ Flexible for future modifications

## Validation

The system validates:
1. ✅ At least 1 item with quantity > 0 is selected
2. ✅ Quantity must be 0-99 (prevents unrealistic orders)
3. ✅ All other existing validations remain (dates, files, etc.)
4. ✅ Item availability check still works (for item types)

## Example Scenarios Now Supported

✅ Rent 2 cameras for documentation
✅ Rent 10 handie talkies for event coordination
✅ Rent 1 projector + 1 screen + 3 microphones
✅ Mix and match any combination with any quantities

## Technical Notes

- **No Database Schema Changes**: Uses existing `item_1, item_2, item_3, item_4` fields
- **Backwards Compatible**: Old records still display correctly
- **Real-time Calculation**: Price updates as user adjusts quantities
- **Real-time Validation**: Quantity field validates on input/change
- **Clear User Feedback**: Error messages for invalid inputs

## Files Modified

1. `/index.html` - Item selection UI
2. `/script.js` - Price calculation and form submission logic

## Testing Checklist

- [x] No JavaScript errors
- [x] No HTML validation errors
- [x] Price calculation correct (qty × price × days)
- [x] Item description formats correctly
- [x] Validation works (0-99 range)
- [x] Real-time price updates
- [x] Form submission includes quantities
- [x] Backward compatible with existing data
