
interface CodeJuniorProgressAPI {
    getLearnerId: () => string;
    readLocalProgress: () => number[];
    writeLocalProgress: (value: unknown) => number[];
    saveProgress: (completedLessons: number[]) => Promise<boolean>;
    syncProgress: () => Promise<number[]>;
}

interface Window {
    CodeJuniorProgress?: CodeJuniorProgressAPI;
    CODEJUNIOR_API_BASE_URL?: string;
}