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

    function getTasks() public view virtual returns (Task[] memory) {
        return tasks;
    }

    function isAdmin() public view virtual returns (bool) {
        if (admins[msg.sender]) {
            return true;
        }
        return false;
    }

    function createTask(string memory _name, string memory _description, uint256 _dueDate) public onlyAdmin {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        tasks.push(Task(_name, _description, _dueDate, false));
        emit TaskCreated(_name, _description, _dueDate);
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

    function addAdmin(address _admin) public onlyAdmin {
        admins[_admin] = true;
    }

    function removeAdmin(address _admin) public onlyAdmin {
        require(msg.sender != _admin, "Cannot remove self from admin list");
        admins[_admin] = false;
    }
}
