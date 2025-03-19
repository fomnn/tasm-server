-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Activities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_Activities" ("createdAt", "description", "id", "title", "updatedAt", "workspaceId") SELECT "createdAt", "description", "id", "title", "updatedAt", "workspaceId" FROM "Activities";
DROP TABLE "Activities";
ALTER TABLE "new_Activities" RENAME TO "Activities";
CREATE TABLE "new_Profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profiles" ("bio", "createdAt", "email", "id", "name", "updatedAt", "userId", "username") SELECT "bio", "createdAt", "email", "id", "name", "updatedAt", "userId", "username" FROM "Profiles";
DROP TABLE "Profiles";
ALTER TABLE "new_Profiles" RENAME TO "Profiles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
