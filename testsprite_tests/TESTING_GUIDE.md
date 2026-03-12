# TestSprite Testing Guide for Ejazah Project

## 📋 Overview

This guide helps you understand the TestSprite test results and how to fix the issues found.

## 🔍 Test Results Summary

### Current Status
- **Total Tests:** 14
- **Passed:** 2 (14.29%)
- **Failed:** 12 (85.71%)

### Critical Issues Found

1. **Login Authentication Failure** (BLOCKING)
   - **Issue:** Login button remains disabled after entering valid credentials
   - **Impact:** Blocks 10+ tests that require authentication
   - **Status:** Partially fixed (added test IDs and improved form)

2. **Certificate Verification API Error**
   - **Issue:** Supabase API returns 406 (Not Acceptable) when querying certificates
   - **Impact:** Users cannot verify certificates
   - **Status:** Needs investigation

## 🛠️ Fixes Applied

### 1. Login Form Improvements
- ✅ Added `data-testid` attributes for better test selectors:
  - `login-email-input`
  - `login-password-input`
  - `login-submit-button`
- ✅ Added `mode: 'onChange'` to React Hook Form for real-time validation
- ✅ Added `autoComplete` attributes for better browser compatibility

### 2. Test Report
- ✅ Comprehensive test report generated at `testsprite_tests/testsprite-mcp-test-report.md`

## 🧪 How to Run Tests

### Option 1: Using TestSprite MCP (Recommended)

1. **Start your development server:**
   ```bash
   cd ijazah-app
   npm run dev
   ```

2. **Bootstrap TestSprite:**
   ```bash
   # TestSprite will automatically detect the running server on port 3000
   ```

3. **Run all tests:**
   ```bash
   # Tests will be executed automatically after bootstrap
   ```

### Option 2: Run Individual Test Files

You can run individual test files using Playwright:

```bash
cd testsprite_tests
python TC001_EmailPassword_Login_Success.py
```

## 🔧 Fixing the Login Issue

### Current Problem
The test reports that the login button remains disabled. This could be due to:

1. **Timing Issues:** The test might be trying to click before the form is ready
2. **Selector Issues:** XPath selectors might be selecting the wrong button
3. **Form Validation:** React Hook Form might be preventing submission

### Recommended Test Improvements

Update your test to use the new `data-testid` attributes:

```python
# Instead of XPath:
elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/form/div/input').nth(0)

# Use data-testid:
elem = frame.locator('[data-testid="login-email-input"]')
await elem.fill('nottest@email.com')

elem = frame.locator('[data-testid="login-password-input"]')
await elem.fill('F4rP$W_eiGEupvx')

elem = frame.locator('[data-testid="login-submit-button"]')
await elem.click(timeout=5000)
```

### Debugging Steps

1. **Check if the form is loaded:**
   ```python
   await page.wait_for_selector('[data-testid="login-submit-button"]', timeout=10000)
   ```

2. **Check button state:**
   ```python
   button = page.locator('[data-testid="login-submit-button"]')
   is_disabled = await button.get_attribute('disabled')
   print(f"Button disabled: {is_disabled}")
   ```

3. **Wait for form validation:**
   ```python
   # Wait a bit after filling fields to let React Hook Form validate
   await page.wait_for_timeout(1000)
   ```

## 🐛 Fixing Certificate Verification Issue

### Problem
Supabase API returns 406 (Not Acceptable) when querying certificates.

### Investigation Steps

1. **Check the API query in `src/app/verify/page.tsx`:**
   - Verify the query format
   - Check if RLS policies allow public read access
   - Verify certificate_number format matches database

2. **Test the query directly in Supabase Dashboard:**
   ```sql
   SELECT * FROM ijazah_certificates 
   WHERE certificate_number = 'HFZ-26-12345';
   ```

3. **Check RLS Policies:**
   - Ensure public users can read certificates for verification
   - Verify the policy conditions

## 📊 Test Coverage

### What's Working ✅
- Error handling for invalid credentials
- Input validation for application forms
- RTL layout on public pages

### What Needs Fixing ❌
- Login authentication (blocking 10+ tests)
- Certificate verification API
- All authenticated features (blocked by login)

## 🚀 Next Steps

1. **Fix Login Issue:**
   - Update test selectors to use `data-testid`
   - Add proper wait conditions
   - Verify form state before clicking

2. **Fix Certificate Verification:**
   - Review Supabase RLS policies
   - Check API query format
   - Test with actual certificate data

3. **Re-run Tests:**
   - After fixes, re-run the full test suite
   - Verify all previously blocked tests pass

4. **Improve Test Reliability:**
   - Replace XPath selectors with `data-testid`
   - Add proper wait conditions
   - Handle async operations correctly

## 📝 Test Files Location

- **Test Code:** `testsprite_tests/tmp/TC*.py`
- **Test Report:** `testsprite_tests/testsprite-mcp-test-report.md`
- **Test Plan:** `testsprite_tests/testsprite_frontend_test_plan.json`
- **Code Summary:** `testsprite_tests/tmp/code_summary.json`

## 🔗 Test Visualization

View detailed test results and visualizations at:
- TestSprite Dashboard: https://www.testsprite.com/dashboard/mcp/tests/

## 💡 Tips

1. **Always start the dev server before running tests**
2. **Use `data-testid` instead of XPath for more reliable selectors**
3. **Add proper wait conditions for async operations**
4. **Check browser console logs for errors**
5. **Verify test credentials exist in Supabase**

## 📞 Support

If you encounter issues:
1. Check the test report for detailed error messages
2. Review browser console logs
3. Verify Supabase configuration
4. Check network requests in browser DevTools
