game_data = {
    background_color: 'grey',
    bg_width: 500,
    bg_height: 500,

    gravity: 0.5,
    acc_left_right_run: 8, // Must be multiple of friction force
    jump_initial_speed: -5,
    floor_type1_friction_force: 1

}


class GameInteractiveObject {

    constructor(html_obj1, gravity=0) {
        this.active_object = true
        this.g_obj = html_obj1 // html object

        this.gravity_pull = gravity // acceleration due to gravity
        this.other_vertical_forces = 0
        this.acc_horizontal = 0 
        this.speed_vertical = 0
        this.speed_horizontal = 0
        this.max_speed_horizontal = 4
        this.min_speed_horizontal = -4

        this.pos_top = 0 
        this.pos_left = 0

        this.vertical_limit_max = game_data.bg_height
        this.horizontal_limit_max = game_data.bg_width
        this.vertical_limit_min = -100
        this.horizontal_limit_min = -100

        this.is_moving = false
        this.is_jumping = false
        this.is_still = false
        this.in_air = true

        this.obstacle_side = 'bottom' // top, left, right
    }

}

let gravity_objects = []
apply_gravity = function(interactive_obj, gravity=10) {
    interactive_obj.gravity_pull = gravity
    gravity_objects.push(interactive_obj)
}

simple_gravity = function() {

    for(let obj of gravity_objects) {
        obj.pos_top = (obj.pos_top + obj.gravity_pull)
        obj.g_obj.style.top = obj.pos_top + 'px'
    }

}

real_gravity = function() {

    for(let obj of gravity_objects) {

        if(obj.active_object) {

            // VERTICAL MOTION CONTROL
            obj.speed_vertical += obj.gravity_pull
            obj.speed_vertical += obj.other_vertical_forces
            obj.pos_top += obj.speed_vertical
            obj.g_obj.style.top = obj.pos_top + 'px'

            if(obj.pos_top > obj.vertical_limit_max) {
                obj.g_obj.remove()
                obj.active_object = false
            }

            //console.log('Vertical speed' + obj.speed_vertical)

            // HORIZONTAL MOTION CONTROL
            obj.speed_horizontal += obj.acc_horizontal

            if(!obj.in_air){
                if(obj.speed_horizontal > 0) obj.speed_horizontal -= game_data.floor_type1_friction_force
                if(obj.speed_horizontal < 0) obj.speed_horizontal += game_data.floor_type1_friction_force
            }

            // Clamp speeds
            if(obj.speed_horizontal > obj.max_speed_horizontal) {
                console.log('Max Clamp')
                obj.speed_horizontal = obj.max_speed_horizontal
            }
            if(obj.speed_horizontal < obj.min_speed_horizontal) {
                console.log('Min Clamp')
                obj.speed_horizontal = obj.min_speed_horizontal
            }

            obj.pos_left += obj.speed_horizontal
            obj.g_obj.style.left = obj.pos_left + 'px'

            if(obj.acc_horizontal > 0) {
                obj.acc_horizontal -= game_data.floor_type1_friction_force
            } else if (obj.acc_horizontal < 0) {
                obj.acc_horizontal += game_data.floor_type1_friction_force
            }
            //console.log('Horizontal Speed' + obj.acc_horizontal)
            //console.log('Horizontal Speed' + obj.speed_horizontal)
        }
    }

}

let obstacle_objects = []
register_obstacle = function(interactive_obj, obstacle_side='bottom') {
    interactive_obj.obstacle_side = obstacle_side
    obstacle_objects.push(interactive_obj)
}

hit_test = function(obj1, obj2) {

    obj1_pos = obj1.g_obj.getBoundingClientRect()
    obj2_pos = obj2.g_obj.getBoundingClientRect()

    if(obj1.obstacle_side == 'bottom' && obj2.obstacle_side == 'top') {
        if(obj1_pos.top + obj1.g_obj.clientHeight >= obj2_pos.top) {
            return 'push_up'
        }
    }

    return false
}

enable_obstacle_forces = function(player) {
    for(let obs of obstacle_objects) {
        hit_flag = hit_test(player, obs)

        if(hit_flag == false) {
            player.other_vertical_forces = 0
        }

        if(hit_flag == 'push_up') {
            player.other_vertical_forces = -game_data.gravity
            player.speed_vertical = 0
        }
    }
}



create_game_article = function(img, html_block='div', height=50, width=50, top=0, left=0) {
    game_obj = document.createElement(html_block)
    game_obj.style.backgroundImage = 'url("' + img + '")'
    game_obj.style.width = width + 'px'
    game_obj.style.height = height + 'px'
    game_obj.style.position = 'absolute'
    game_obj.style.top = top +'px'
    game_obj.style.left = left +'px'

    game_obj_interactive = new GameInteractiveObject(game_obj)
    game_obj_interactive.pos_top = top
    game_obj_interactive.pos_left = left

    return game_obj_interactive
}

init_game = function() {
    document.body.style.backgroundColor = game_data.background_color

    game_background = document.getElementById('game-bg')
    game_background.style.width = game_data.bg_width + 'px'
    game_background.style.height = game_data.bg_height + 'px'
    game_background.style.backgroundImage = 'url("./img/bg.jpg")'
    game_background.style.position = 'relative'

    run_gravity_id = setInterval(real_gravity, 10) // Start world gravity

    player = create_game_article("./img/player.jpg")
    game_background.appendChild(player.g_obj)
    apply_gravity(player, game_data.gravity)

    other_forces_id = setInterval(enable_obstacle_forces, 1, player) // Start other forces
    

    block1 = create_game_article("./img/block1.jpg", html_block='div', height=50, width=500, top=450, left=0)
    game_background.appendChild(block1.g_obj)
    register_obstacle(block1, obstacle_side='top')


 
}

document.addEventListener('DOMContentLoaded', () => {

    console.log("Game Start . . . . . . . ")

    init_game()

    document.addEventListener('keyup', (e)=> {

        if(e.key == 'ArrowUp') {
            console.log('Jump')

            // Jump only if landed
            if(player.speed_vertical == 0)
                player.speed_vertical = game_data.jump_initial_speed
        }

        player.acc_horizontal = 0
    })


    document.addEventListener('keydown', (e)=> {
        if(e.key == 'ArrowRight') {
            console.log('Right')
            player.acc_horizontal = game_data.acc_left_right_run
        }

        if(e.key == 'ArrowLeft') {
            console.log('Left')
            player.acc_horizontal = -game_data.acc_left_right_run
        }
    })

})