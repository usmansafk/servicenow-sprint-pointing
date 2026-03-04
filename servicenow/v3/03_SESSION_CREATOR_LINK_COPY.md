# Session Creator - Link Copy Functionality (V3)

This guide adds link copy functionality to the Session Creator widget with visual feedback.

## What This Adds

- Click the session link field → auto-select text
- Click the copy icon button → copy link to clipboard
- Show "Link copied!" toast notification for 2 seconds

## Implementation Steps

### Step 1: Update HTML Template

1. Navigate to **Service Portal > Widgets** in ServiceNow
2. Find and open the **Session Creator** widget
3. Click on the **HTML Template** tab
4. Find the session link display section (after session creation)
5. Replace the link display section with this code:

```html
<!-- Session Created Success -->
<div ng-if="c.createdSession" class="session-created">
  <div class="success-icon">
    <i class="fa fa-check-circle fa-4x text-success"></i>
  </div>
  
  <h3>Session Created!</h3>
  
  <div class="session-info">
    <div class="info-row">
      <label>Session Code:</label>
      <div class="code-display">
        <span class="session-code">{{c.createdSession.session_code}}</span>
        <button class="btn btn-sm btn-icon" ng-click="c.copyCode()" title="Copy code">
          <i class="fa fa-copy"></i>
        </button>
      </div>
    </div>
    
    <div class="info-row">
      <label>Session Link:</label>
      <div class="link-display">
        <input type="text" 
               id="session-link-field"
               class="form-control link-field" 
               ng-model="c.sessionUrl" 
               readonly
               ng-click="c.copySessionLink()">
        <button class="btn btn-sm btn-icon" ng-click="c.copySessionLink()" title="Copy link">
          <i class="fa fa-copy"></i>
        </button>
      </div>
    </div>
  </div>
  
  <div class="session-actions">
    <a ng-href="{{c.sessionUrl}}" class="btn btn-primary btn-lg" target="_blank">
      <i class="fa fa-external-link"></i> Open Session
    </a>
    <button class="btn btn-default" ng-click="c.reset()">
      <i class="fa fa-plus"></i> Create Another
    </button>
  </div>
</div>

<!-- Toast Notification -->
<div class="toast-notification" ng-class="{'visible': c.toastVisible}">
  <i class="fa fa-check-circle"></i>
  <span>{{c.toastMessage}}</span>
</div>
```

### Step 2: Update CSS

Add this CSS to the widget's **CSS - SCSS** tab:

```css
/* Link Display */
.link-display {
  display: flex;
  gap: 8px;
  align-items: center;
}

.link-field {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  cursor: pointer;
  background: #f5f5f5;
}

.link-field:focus {
  background: #fff;
  border-color: #2196f3;
}

.btn-icon {
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: #2196f3;
  border-color: #2196f3;
  color: white;
}

.btn-icon i {
  font-size: 14px;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #4caf50;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 9999;
}

.toast-notification.visible {
  opacity: 1;
  transform: translateY(0);
}

.toast-notification i {
  font-size: 18px;
}

.toast-notification span {
  font-size: 14px;
  font-weight: 500;
}
```

### Step 3: Client Controller Already Updated

The client controller code was already updated in Task 3.1 with the `copySessionLink()` and `showToast()` methods. If you haven't updated it yet, use the code from `servicenow/v3/widgets/session_creator/client_controller.js`.

The key methods are:

```javascript
/**
 * Copy session link to clipboard with visual feedback
 */
c.copySessionLink = function() {
  if (!c.sessionUrl) {
    return;
  }
  
  // Select the text in the link field
  var linkField = document.getElementById('session-link-field');
  if (linkField) {
    linkField.select();
  }
  
  // Copy to clipboard
  navigator.clipboard.writeText(c.sessionUrl)
    .then(function() {
      c.showToast('Link copied!', 2000);
    })
    .catch(function(error) {
      console.error('Failed to copy link:', error);
      c.showToast('Failed to copy link', 2000);
    });
};

/**
 * Show toast notification
 */
c.showToast = function(message, duration) {
  c.toastMessage = message;
  c.toastVisible = true;
  
  setTimeout(function() {
    $scope.$apply(function() {
      c.toastVisible = false;
    });
  }, duration);
};
```

## Testing

1. Navigate to **Sprint Pointing > Create Session**
2. Create a new session
3. After session is created, you should see the session link field
4. **Test 1**: Click the link field → text should auto-select
5. **Test 2**: Click the copy icon button → "Link copied!" toast should appear for 2 seconds
6. **Test 3**: Paste the link in a new browser tab → should open the session

## Browser Compatibility

The `navigator.clipboard.writeText()` API requires:
- HTTPS connection (or localhost for testing)
- Modern browsers (Chrome 63+, Firefox 53+, Safari 13.1+, Edge 79+)

If you're testing on HTTP (not HTTPS), the copy may fail. Use localhost or HTTPS for testing.

## Troubleshooting

### Copy doesn't work
- Check browser console for errors
- Verify you're on HTTPS or localhost
- Try a different browser

### Toast doesn't appear
- Check that the CSS was added correctly
- Verify the toast-notification div is in the HTML
- Check browser console for JavaScript errors

### Text doesn't select
- Verify the input field has `id="session-link-field"`
- Check that the field is not disabled
- Try clicking directly on the text

## Requirements Validated

- 2.1: Click link field → auto-select text ✓
- 2.2: Click copy icon → copy to clipboard ✓
- 2.3: Show "Link copied!" toast ✓
- 2.4: Toast visible for 2 seconds ✓
- 2.5: Toast auto-dismisses ✓
