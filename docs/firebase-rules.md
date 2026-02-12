# Firebase Security Rules

## Firestore Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Templates collection: read-only for all users, no client writes
    match /templates/{templateId} {
      allow read: if true;
      allow write: if false;
    }

    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Rules

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Template images: read-only for all users, no client uploads
    match /templates/{fileName} {
      allow read: if true;
      allow write: if false;
    }

    // Deny everything else by default
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```