import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import TaskListContract from './contracts/TaskList.json'

export const useInterval = (callback, delay) => {

  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);


  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function App() {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [contract, setContract] = useState();
  const [selectedAccount, setSelectedAccount] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminList, setAdminList] = useState([]);

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);

  useInterval(() => {
    if (isConnected) {
      updateTaskList();
    }
  }, [10 * 1000]);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccountAddress(accounts[0]);
      setIsConnected(true);
      setup();
    } catch (error) {
      setIsConnected(false);
    }
  };

  const setup = async() => {
    if (window.ethereum) {
      const contractAddress = "0x428A37f6a5f864C84bC933AB6eF999A8d358b363";
      const contract = new ethers.Contract(
        contractAddress,
        TaskListContract.abi,
        provider.getSigner()
      );
      setContract(contract);
      const isAdmin = await contract.isAdmin();
      setIsAdmin(isAdmin);
      if (isAdmin) {
        const adminArray = accountAddress;
        setAdminList(adminArray);
      }
    }
  }

  function dateToTimestamp(date) {
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    return timestamp;
  }

  function timestampToDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date;
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    try {
      const contractWithSigner = contract.connect(provider.getSigner());
      await contractWithSigner.createTask(name, description, dateToTimestamp(dueDate));
    } catch (error) {
      console.error(error);
    }
    setName("");
    setDescription("");
    setDueDate("");
    updateTaskList();
  }

  async function updateTaskList() {
    try {
      var blockchainTasks = await contract.getTasks();
      // blockchainTasks.sort(function(a, b) {
      //   return parseInt(a.dueDate) - parseInt(b.dueDate);
      // });
      console.log(blockchainTasks);
      setTasks(blockchainTasks);
    } catch (error) {
      console.log(error);
    }

  }

  async function handleMarkAsComplete(index) {
    try {
      const contractWithSigner = contract.connect(provider.getSigner());
      await contractWithSigner.markTaskAsComplete(index);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRemove(index) {
    try {
      const contractWithSigner = contract.connect(provider.getSigner());
      await contractWithSigner.removeTask(index);
    } catch (error) {
      console.log(error);
    }

  }

  return (
    <div className="App">
      <header className="App-header">
        {haveMetamask ? (
          <div className="App-header">
            {isConnected ? (
              <div className="card">
                <div className="card-row">
                  <h3>Task List</h3>
                  <h3>Wallet Address:</h3>
                  <p>
                    {accountAddress.slice(0, 4)}...
                    {accountAddress.slice(38, 42)}
                  </p>
                </div>
              </div>
            ) : (
              <h3>Task List</h3>
            )}
            {isConnected ? (
              <div className="card">
                <p className="info">🎉 Connected Successfully</p>
                <h4>Create Task</h4>
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

                <h4>Tasks</h4>
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
            ) : (
              <button className="btn" onClick={connectWallet}>
                Connect
              </button>
            )}
          </div>
        ) : (
          <p>Please Install MataMask</p>
        )}
      </header>
    </div>
  );
}

export default App;
