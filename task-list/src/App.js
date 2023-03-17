import React, { useState, useEffect } from "react";
//import { ethers } from "ethers";
import TaskListContract from "./contracts/TaskList.json";

const { ethers } = require("ethers");

function App() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [provider, setProvider] = useState();
  const [contract, setContract] = useState();
  const [selectedAccount, setSelectedAccount] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminList, setAdminList] = useState([]);

  useEffect(() => {
    async function setup() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const contractAddress = "0xB4D9E311B49eEbf332a6248f49C2f34224D5aE99";
        const contract = new ethers.Contract(
          contractAddress,
          TaskListContract.abi,
          provider.getSigner()
        );
        setContract(contract);
        const isAdmin = await contract.isAdmin();
        setIsAdmin(isAdmin);
        if (isAdmin) {
          const adminArray = await contract.getAdminList();
          setAdminList(adminArray);
        }
      }
    }
    setup();
  }, []);

  useEffect(() => {
    async function getTasks() {
      if (contract) {
        const taskArray = await contract.viewTasks();
        setTasks(taskArray);
      }
    }
    getTasks();
  }, [contract]);

  async function handleCreateTask(e) {
    e.preventDefault();
    const overrides = { gasLimit: 1000000 };
    await contract.createTask(name, description, dueDate, overrides);
    setName("");
    setDescription("");
    setDueDate("");
  }

  async function handleMarkAsComplete(index) {
    const overrides = { gasLimit: 1000000 };
    await contract.markTaskAsComplete(index, overrides);
  }

  async function handleRemove(index) {
    const overrides = { gasLimit: 1000000 };
    await contract.removeTask(index, overrides);
  }

  async function handleConnectWallet() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setSelectedAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddAdmin(e) {
    e.preventDefault();
    const overrides = { gasLimit: 1000000 };
    const admin = e.target.elements.admin.value;
    await contract.addAdmin(admin, overrides);
    e.target.elements.admin.value = "";
    const adminArray = await contract.getAdminList();
    setAdminList(adminArray);
  }

  async function handleRemoveAdmin(e) {
    e.preventDefault();
    const overrides = { gasLimit: 1000000 };
    const admin = e.target.elements.admin.value;
    await contract.removeAdmin(admin, overrides);
    e.target.elements.admin.value = "";
    const adminArray = await contract.getAdminList();
    setAdminList(adminArray);
  }

  if (!provider) {
    return <div>Please install Metamask</div>;
  }

  if (!contract) {
    return <div>Loading contract...</div>;
  }

  return (
    <div>
      <h1>Task List</h1>
      <div>
        <button onClick={handleConnectWallet}>Connect Wallet</button>
        {selectedAccount && <p>Connected with account: {selectedAccount}</p>}
      </div>
      {isAdmin && (
        <div>
          <h2>Add/Remove Admins</h2>
          <form onSubmit={handleAddAdmin}>
            <label>
              Add Admin:
              <input type="text" name="admin" />
            </label>
            <button type="submit">Add</button>
          </form>
          <form onSubmit={handleRemoveAdmin}>
            <label>
              Remove Admin:
              <input type="text" name="admin" />
            </label>
            <button type="submit">Remove</button>
          </form>
          <h3>Current Admins:</h3>
          <ul>
            {adminList.map((admin) => (
              <li key={admin}>{admin}</li>
            ))}
          </ul>
        </div>
      )}
      <h2>Create Task</h2>
      <form onSubmit={handleCreateTask}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Due Date:
          <input
            type="date"
            name="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
        <button type="submit">Create Task</button>
      </form>
      <h2>Tasks</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
            .map((task, index) => (
              <tr key={index}>
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td>{task.dueDate}</td>
                <td>
                  {!task.completed && (
                    <button onClick={() => handleMarkAsComplete(index)}>
                      Mark as Complete
                    </button>
                  )}
                  <button onClick={() => handleRemove(index)}>Remove</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;