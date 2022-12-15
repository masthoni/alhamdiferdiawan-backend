const {AbilityBuilder, Ability} = require('@casl/ability');

const policies = {
    admin(user, {can}){

    },

    manager(user, {can}){

    },

    accountant(user, {can}){

    },

    executive(user, {can}){

    },

    stockist(user, {can}){

    },

    puchasing(user, {can}){

    },

    cashier(user, {can}){

    }
}

function policyFor(user){
    let builder = new AbilityBuilder();
    if(user && typeof policies[user.role] === 'function'){
        policies[user.role](user, builder);
    } else {
        throw new Error(`Trying to use unknown role "${user.role}"`);
    }
    return new Ability(builder.rules);
}

module.exports = {
    policyFor
}