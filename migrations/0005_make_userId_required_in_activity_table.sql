-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Activities_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspaces" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_Activities" ("createdAt", "description", "id", "title", "updatedAt", "userId", "workspaceId") SELECT "createdAt", "description", "id", "title", "updatedAt", "userId", "workspaceId" FROM "Activities";
DROP TABLE "Activities";
ALTER TABLE "new_Activities" RENAME TO "Activities";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
