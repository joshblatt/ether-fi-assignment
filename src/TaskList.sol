// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract TaskList {
    struct Task {
        string name;
        string description;
        uint256 dueDate;
        bool completed;
    }

    Task[] public tasks;
    mapping(address => bool) public admins;

    event TaskCreated(string name, string description, uint256 dueDate);
    event TaskMarkedAsComplete(uint256 index);
    event TaskRemoved(uint256 index);

    constructor() {
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admins can perform this action");
        _;
    }

    function createTask(string memory _name, string memory _description, uint256 _dueDate) public onlyAdmin {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        tasks.push(Task(_name, _description, _dueDate, false));
        emit TaskCreated(_name, _description, _dueDate);
    }

    function viewTasks() public view returns (Task[] memory) {
        return sortTasksByDueDate(tasks);
    }

    function markTaskAsComplete(uint256 index) public onlyAdmin {
        require(index < tasks.length, "Task does not exist");
        require(!tasks[index].completed, "Task is already completed");
        tasks[index].completed = true;
        emit TaskMarkedAsComplete(index);
    }

    function removeTask(uint256 index) public onlyAdmin {
        require(index < tasks.length, "Task does not exist");
        emit TaskRemoved(index);
        if (index != tasks.length - 1) {
            tasks[index] = tasks[tasks.length - 1];
        }
        tasks.pop();
    }

    function sortTasksByDueDate(Task[] memory taskArray) private pure returns (Task[] memory) {
        uint256 n = taskArray.length;
        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (taskArray[j].dueDate > taskArray[j + 1].dueDate) {
                    Task memory temp = taskArray[j];
                    taskArray[j] = taskArray[j + 1];
                    taskArray[j + 1] = temp;
                }
            }
        }
        return taskArray;
    }

    function addAdmin(address _admin) public onlyAdmin {
        admins[_admin] = true;
    }

    function removeAdmin(address _admin) public onlyAdmin {
        require(msg.sender != _admin, "Cannot remove self from admin list");
        admins[_admin] = false;
    }
}
