import { saveExcelToFile, saveCsvToFile } from "./excel-csv";
import { invoke } from "@tauri-apps/api/core";

jest.mock("@tauri-apps/api/core");

describe("excel-csv utils", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("saveExcelToFile", () => {
        it("should invoke Tauri command to save Excel file", async () => {
            const filePath = "/path/to/file.xlsx";
            const sheetData = [
                ["Name", "Age", "City"],
                ["John", "30", "New York"],
                ["Jane", "25", "London"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveExcelToFile(filePath, sheetData);

            expect(invoke).toHaveBeenCalledWith("save_excel_to_file", {
                filePath,
                sheetData,
            });
        });

        it("should handle single row data", async () => {
            const sheetData = [["Header1", "Header2", "Header3"]];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveExcelToFile("/test.xlsx", sheetData);

            expect(invoke).toHaveBeenCalledWith("save_excel_to_file", {
                filePath: "/test.xlsx",
                sheetData,
            });
        });

        it("should handle empty data array", async () => {
            const sheetData: Array<Array<string>> = [];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveExcelToFile("/empty.xlsx", sheetData);

            expect(invoke).toHaveBeenCalledWith("save_excel_to_file", {
                filePath: "/empty.xlsx",
                sheetData: [],
            });
        });

        it("should handle large datasets", async () => {
            const largeData = Array.from({ length: 10000 }, (_, i) => [
                `Row${i}`,
                `Value${i}`,
                `Data${i}`,
            ]);
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveExcelToFile("/large.xlsx", largeData);

            expect(invoke).toHaveBeenCalledWith("save_excel_to_file", {
                filePath: "/large.xlsx",
                sheetData: largeData,
            });
        });

        it("should handle special characters in data", async () => {
            const sheetData = [
                ["Name", "Description"],
                ["Test@123", "Special chars: !@#$%^&*()"],
                ["Unicode", "中文字符"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveExcelToFile("/special.xlsx", sheetData);

            expect(invoke).toHaveBeenCalled();
        });

        it("should handle different column counts per row", async () => {
            const sheetData = [
                ["A", "B", "C"],
                ["1", "2"],
                ["X", "Y", "Z", "Extra"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveExcelToFile("/irregular.xlsx", sheetData);

            expect(invoke).toHaveBeenCalledWith("save_excel_to_file", {
                filePath: "/irregular.xlsx",
                sheetData,
            });
        });

        it("should handle invoke errors", async () => {
            (invoke as jest.Mock).mockRejectedValue(new Error("File write failed"));

            await expect(saveExcelToFile("/error.xlsx", [[]])).rejects.toThrow(
                "File write failed"
            );
        });
    });

    describe("saveCsvToFile", () => {
        it("should invoke Tauri command to save CSV file", async () => {
            const filePath = "/path/to/file.csv";
            const sheetData = [
                ["Name", "Age", "City"],
                ["John", "30", "New York"],
                ["Jane", "25", "London"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile(filePath, sheetData);

            expect(invoke).toHaveBeenCalledWith("save_csv_to_file", {
                filePath,
                sheetData,
            });
        });

        it("should handle single column data", async () => {
            const sheetData = [["Column1"], ["Value1"], ["Value2"], ["Value3"]];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/single-column.csv", sheetData);

            expect(invoke).toHaveBeenCalledWith("save_csv_to_file", {
                filePath: "/single-column.csv",
                sheetData,
            });
        });

        it("should handle empty data array", async () => {
            const sheetData: Array<Array<string>> = [];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/empty.csv", sheetData);

            expect(invoke).toHaveBeenCalledWith("save_csv_to_file", {
                filePath: "/empty.csv",
                sheetData: [],
            });
        });

        it("should handle data with commas", async () => {
            const sheetData = [
                ["Name", "Address"],
                ["John Doe", "123 Main St, Apt 4, New York"],
                ["Jane Smith", "456 Oak Ave, Suite 100, London"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/commas.csv", sheetData);

            expect(invoke).toHaveBeenCalledWith("save_csv_to_file", {
                filePath: "/commas.csv",
                sheetData,
            });
        });

        it("should handle data with quotes", async () => {
            const sheetData = [
                ["Quote", "Text"],
                ['"Hello"', 'She said "hi"'],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/quotes.csv", sheetData);

            expect(invoke).toHaveBeenCalled();
        });

        it("should handle large CSV datasets", async () => {
            const largeData = Array.from({ length: 50000 }, (_, i) => [
                `ID${i}`,
                `Name${i}`,
                `Value${i}`,
            ]);
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/large.csv", largeData);

            expect(invoke).toHaveBeenCalledWith("save_csv_to_file", {
                filePath: "/large.csv",
                sheetData: largeData,
            });
        });

        it("should handle newlines in data", async () => {
            const sheetData = [
                ["Field1", "Field2"],
                ["Line1\nLine2", "Normal text"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/newlines.csv", sheetData);

            expect(invoke).toHaveBeenCalled();
        });

        it("should handle invoke errors", async () => {
            (invoke as jest.Mock).mockRejectedValue(new Error("CSV write failed"));

            await expect(saveCsvToFile("/error.csv", [[]])).rejects.toThrow(
                "CSV write failed"
            );
        });

        it("should handle numeric data as strings", async () => {
            const sheetData = [
                ["Number", "Value"],
                ["123", "456.789"],
                ["0", "-999"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/numbers.csv", sheetData);

            expect(invoke).toHaveBeenCalledWith("save_csv_to_file", {
                filePath: "/numbers.csv",
                sheetData,
            });
        });

        it("should handle empty strings in data", async () => {
            const sheetData = [
                ["Col1", "Col2", "Col3"],
                ["", "value", ""],
                ["data", "", "more"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveCsvToFile("/empty-cells.csv", sheetData);

            expect(invoke).toHaveBeenCalled();
        });
    });

    describe("integration scenarios", () => {
        it("should save same data to both Excel and CSV", async () => {
            const sheetData = [
                ["Header1", "Header2"],
                ["Data1", "Data2"],
            ];
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveExcelToFile("/file.xlsx", sheetData);
            await saveCsvToFile("/file.csv", sheetData);

            expect(invoke).toHaveBeenCalledTimes(2);
            expect(invoke).toHaveBeenNthCalledWith(1, "save_excel_to_file", {
                filePath: "/file.xlsx",
                sheetData,
            });
            expect(invoke).toHaveBeenNthCalledWith(2, "save_csv_to_file", {
                filePath: "/file.csv",
                sheetData,
            });
        });
    });
});
