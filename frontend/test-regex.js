const userCode = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{};
    }
}`;
const stdin = `nums = [3,2,4], target = 6`;

const methodMatch = userCode.match(/public\s+([a-zA-Z0-9_\[\]<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
const returnType = methodMatch[1].trim();
const methodName = methodMatch[2].trim();
const paramList = methodMatch[3].split(',').map(p => p.trim());
const paramTypes = paramList.map(p => p.split(/\s+/)[0]);

const rawValues = stdin.match(/\[.*?\]|-?\d+|".*?"/g) || [];

console.log(returnType, methodName, paramTypes, rawValues);
