-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profiles" ("createdAt", "email", "id", "name", "profilePictureUrl", "updatedAt", "userId", "username") SELECT "createdAt", "email", "id", "name", "profilePictureUrl", "updatedAt", "userId", "username" FROM "Profiles";
DROP TABLE "Profiles";
ALTER TABLE "new_Profiles" RENAME TO "Profiles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
