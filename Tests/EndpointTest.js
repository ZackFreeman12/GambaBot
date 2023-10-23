
const axios = require('axios');
const { deleteToken } = require('../config.json');
const post1 = { "userid": "118496877531496454", "points": "3434", "streak": "1", "lifetime": 5000 };
const put1 = { "points": "0", "streak": 100, "lifetime": 300 };

async function test() {

    try {
        //Testing rest post end-point
        const postUser = await axios.post("http://localhost:3000/api/new-user", post1);
        console.log(postUser.data);

        //Testing rest get/userid endpoint
        const getUser = await axios.get('http://localhost:3000/api/get/118496877531496454');
        console.log(getUser.data[0])

        //Testing rest update endpoint
        const putUser = await axios.put("http://localhost:3000/api/update/118496877531496454", put1);
        console.log(putUser.data);
        const testPut = await axios.get('http://localhost:3000/api/get/118496877531496454');
        console.log(testPut.data[0])

        //Testing rest delete endpoint
        const deleteDatabase = await axios.delete('http://localhost:3000/api/' + deleteToken);
        console.log(deleteDatabase.data);
        const testDelete = await axios.get('http://localhost:3000/api/get/118496877531496454');
        console.log(testDelete.data[0])

        console.log("ALL TESTS SUCCESSFUL")
    }
    catch (error) {

        console.error(error);
    }


}

test();

