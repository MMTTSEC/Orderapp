// example raw data
let raw = [
  {
    "id": "4xja7h2nzwez4zv0pqm7yvp8dc",
    "title": "Anonymous can get pets and petowners",
    "roles": [
      "Anonymous"
    ],
    "contentTypes": [
      "Pet",
      "PetOwner"
    ],
    "restMethods": [
      "GET"
    ]
  },
  {
    "id": "4c4be767rzjpp7vzbszfs6y7wt",
    "title": "Anonymous and Customer can post, put and delete pets",
    "roles": [
      "Anonymous",
      "Customer"
    ],
    "contentTypes": [
      "Pet"
    ],
    "restMethods": [
      "POST",
      "PUT",
      "DELETE"
    ]
  }
];


// sum raw data - in c# probably easiest to do using Dyndatas Obj feature
let permissionsByRole = {};

for (let { roles, contentTypes, restMethods } of raw) {
  for (let role of roles) {
    permissionsByRole[role] = permissionsByRole[role] || {};
    for (let contentType of contentTypes) {
      permissionsByRole[role][contentType] = permissionsByRole[role][contentType] || {};
      for (let restMethod of restMethods) {
        permissionsByRole[role][contentType][restMethod] = true;
      }
    }
  }
}

console.log(permissionsByRole);

function checkPermission(role, contentType, requestMethod) {
  return !!(permissionsByRole[role]?.[contentType]?.[requestMethod]);
}

console.log(checkPermission('Anonymous', 'PetOwner', 'GET'));
console.log(checkPermission('Customer', 'PetOwner', 'GET'));