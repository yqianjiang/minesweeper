export function searchInsert(nums, target) {
  // nums有序：二分法
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const middle = left + Math.floor((right - left) / 2);
    if (target === nums[middle].time) {
      return middle;
    }
    if (target > nums[middle].time) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return left;
};
