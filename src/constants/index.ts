import { Clock, Code2, Calendar, Users } from "lucide-react";

export const INTERVIEW_CATEGORY = [
  { id: "upcoming", title: "Upcoming Interviews", variant: "outline" },
  { id: "completed", title: "Completed", variant: "secondary" },
  { id: "succeeded", title: "Succeeded", variant: "default" },
  { id: "failed", title: "Failed", variant: "destructive" },
] as const;

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export const QUICK_ACTIONS = [
  {
    icon: Code2,
    title: "New Call",
    description: "Start an instant call",
    color: "primary",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: Users,
    title: "Join Interview",
    description: "Enter via invitation link",
    color: "purple-500",
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    icon: Calendar,
    title: "Schedule",
    description: "Plan upcoming interviews",
    color: "blue-500",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  {
    icon: Clock,
    title: "Recordings",
    description: "Access past interviews",
    color: "orange-500",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
];

export const CODING_QUESTIONS: CodeQuestion[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers in the array such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}`,
      python: `def two_sum(nums, target):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
      cpp: `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
  // Write your solution here
    
}`,
      go: `func twoSum(nums []int, target int) []int {
      // Write your solution here
    
}`,
    },
    constraints: [
      "2 ≤ nums.length ≤ 104",
      "-109 ≤ nums[i] ≤ 109",
      "-109 ≤ target ≤ 109",
      "Only one valid answer exists.",
    ],
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    starterCode: {
      javascript: `function reverseString(s) {
  // Write your solution here
  
}`,
      python: `def reverse_string(s):
    # Write your solution here
    pass`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Write your solution here
        
    }
}`,
      cpp: `#include <vector>
using namespace std;

void reverseString(vector<char>& s) {
     // Write your solution here

}`,
      go: `func reverseString(s []byte)  {
    // Write your solution here

}`,
    },
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    description:
      "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation:
          "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
    ],
    starterCode: {
      javascript: `function isPalindrome(x) {
  // Write your solution here
  
}`,
      python: `def is_palindrome(x):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        //write your solution here
    }
}`,
      cpp: `bool isPalindrome(int x) {
       // Write your solution here
    
}`,
      go: `func isPalindrome(x int) bool {
    // Write your solution here

}`,
    },
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    description:
      "Find length of longest substring without repeating characters.",
    examples: [
      {
        input: '"abcabcbb"',
        output: "3",
        explanation: "The answer is 'abc', with length 3.",
      },
      {
        input: '"bbbbb"',
        output: "1",
      },
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
       // Write your solution here
  
}`,
      python: `def length_of_longest_substring(s):
       # Write your solution here
    pass`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
         // Write your solution here

    }
}`,
      cpp: `#include <string>
using namespace std;

int lengthOfLongestSubstring(string s) {
     // Write your solution here

}`,
      go: `func lengthOfLongestSubstring(s string) int {
    // Write your solution here

}`,
    },
    constraints: [
      "0 ≤ s.length ≤ 5 * 10^4",
      "s consists of English letters, digits, symbols, and spaces",
    ],
  },

  {
    id: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    description:
      "Find median of two sorted arrays in O(log(m+n)).",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.0",
        explanation: "Merged array = [1,2,3], median = 2",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.5",
      },
    ],
    starterCode: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {
       // Write your solution here
  
}`,
      python: `def find_median_sorted_arrays(nums1, nums2):
       # Write your solution here
    pass`,
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
         // Write your solution here

    }
}`,
      cpp: `#include <vector>
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
 // Write your solution here
    
}`,
      go: `func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
    // Write your solution here

}`,
    },
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 ≤ m, n ≤ 1000",
      "1 ≤ m + n ≤ 2000",
      "-10^6 ≤ nums1[i], nums2[i] ≤ 10^6",
    ],
  },
];

export const LANGUAGES = [
  { id: "javascript", name: "JavaScript", icon: "/javascript.png" },
  { id: "python", name: "Python", icon: "/python.png" },
  { id: "java", name: "Java", icon: "/java.png" },
  { id: "cpp", name: "C++", icon: "/cpp.png" },
  { id: "go", name: "Go", icon: "/go.png" },
] as const;

export interface CodeQuestion {
  id: string;
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
    go: string;
  };
  constraints?: string[];
}

export type QuickActionType = (typeof QUICK_ACTIONS)[number];