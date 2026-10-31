/**
 * Godot 4 Production Ready Project Scripts & Architecture
 * Fully formatted GDScript 2.0 (Godot 4.3+) with Android Mobile Controls.
 */

export interface GodotFile {
  path: string;
  name: string;
  description: string;
  code: string;
}

export const GODOT_PROJECT_FILES: GodotFile[] = [
  {
    path: 'project.godot',
    name: 'project.godot',
    description: 'Main Godot 4 project configuration file for Android & Desktop',
    code: `; Engine configuration file.
; Project: Indian Life RP - Middle Class Edition
; Tagline: "Apni Zindagi Khud Banao – Your Life, Your Family, Your Future."

config_version=5

[application]
config/name="Indian Life RP - Middle Class Edition"
config/description="3D Open-World Indian Life Simulator for Android and PC"
run/main_scene="res://scenes/world.tscn"
config/features=PackedStringArray("4.3", "Forward Plus", "Mobile")
config/icon="res://icon.svg"

[display]
window/size/viewport_width=1280
window/size/viewport_height=720
window/size/mode=0
window/stretch/mode="canvas_items"
window/stretch/aspect="expand"
window/handheld/orientation=1

[input]
move_forward={
  "deadzone": 0.5,
  "events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":4194320,"physical_keycode":87,"key_label":0,"unicode":119,"echo":false,"script":null)]
}
move_backward={
  "deadzone": 0.5,
  "events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":4194322,"physical_keycode":83,"key_label":0,"unicode":115,"echo":false,"script":null)]
}
move_left={
  "deadzone": 0.5,
  "events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":4194319,"physical_keycode":65,"key_label":0,"unicode":97,"echo":false,"script":null)]
}
move_right={
  "deadzone": 0.5,
  "events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":4194321,"physical_keycode":68,"key_label":0,"unicode":100,"echo":false,"script":null)]
}
interact={
  "deadzone": 0.5,
  "events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":69,"physical_keycode":69,"key_label":0,"unicode":101,"echo":false,"script":null)]
}
jump={
  "deadzone": 0.5,
  "events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":32,"physical_keycode":32,"key_label":0,"unicode":32,"echo":false,"script":null)]
}

[rendering]
renderer/rendering_method="mobile"
textures/vram_compression/import_etc2_astc=true
environment/defaults/default_environment="res://default_env.tres"
`
  },
  {
    path: 'scripts/player.gd',
    name: 'player.gd',
    description: 'CharacterBody3D Controller with Third-Person Camera and Android Touch Input',
    code: `extends CharacterBody3D
class_name PlayerController

# Indian Life RP - Character Controller
# Supports Android Virtual Joystick & Physical Desktop WASD

@export var walk_speed: float = 4.2
@export var run_speed: float = 7.5
@export var jump_velocity: float = 4.8
@export var rotation_speed: float = 10.0

@onready var camera_pivot: Node3D = $CameraPivot
@onready var visual_mesh: Node3D = $VisualMesh
@onready var interaction_ray: RayCast3D = $InteractionRay

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
var touch_joystick_vector: Vector2 = Vector2.ZERO
var is_sprinting: bool = false
var is_driving: bool = false
var current_vehicle: Node3D = null

signal interacted_with_object(target_node: Node)

func _physics_process(delta: float) -> void:
	if is_driving:
		return

	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Handle Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity

	# Get Input from Keyboard or Android Touch Joystick
	var input_dir: Vector2 = Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	if touch_joystick_vector.length() > 0.05:
		input_dir = touch_joystick_vector

	var speed = run_speed if is_sprinting else walk_speed

	# Camera relative direction
	var cam_transform = camera_pivot.global_transform
	var forward = -cam_transform.basis.z
	var right = cam_transform.basis.x
	forward.y = 0.0
	right.y = 0.0
	forward = forward.normalized()
	right = right.normalized()

	var move_direction = (right * input_dir.x + forward * input_dir.y).normalized()

	if move_direction != Vector3.ZERO:
		velocity.x = move_direction.x * speed
		velocity.z = move_direction.z * speed

		# Rotate character facing
		var target_angle = atan2(move_direction.x, move_direction.z)
		visual_mesh.rotation.y = lerp_angle(visual_mesh.rotation.y, target_angle, rotation_speed * delta)
	else:
		velocity.x = move_toward(velocity.x, 0.0, speed * 8.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, speed * 8.0 * delta)

	move_and_slide()

	# Interaction check
	if Input.is_action_just_pressed("interact"):
		try_interact()

func try_interact() -> void:
	if interaction_ray.is_colliding():
		var collider = interaction_ray.get_collider()
		if collider and collider.has_method("on_interact"):
			collider.on_interact(self)
			interacted_with_object.emit(collider)

func set_touch_joystick(vec: Vector2) -> void:
	touch_joystick_vector = vec

func set_sprint(sprinting: bool) -> void:
	is_sprinting = sprinting
`
  },
  {
    path: 'scripts/third_person_camera.gd',
    name: 'third_person_camera.gd',
    description: 'Smooth SpringArm3D orbit camera with mobile swipe gesture rotation',
    code: `extends SpringArm3D
class_name ThirdPersonCamera

@export var target: Node3D
@export var mouse_sensitivity: float = 0.003
@export var touch_sensitivity: float = 0.005
@export var min_pitch: float = -60.0
@export var max_pitch: float = 40.0

var is_touching_camera: bool = false
var touch_index: int = -1

func _ready() -> void:
	add_excluded_object(target.get_rid())

func _unhandled_input(event: InputEvent) -> void:
	# Desktop Mouse Orbit
	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		rotate_camera(event.relative.x * mouse_sensitivity, event.relative.y * mouse_sensitivity)

	# Android Touch Drag Orbit
	if event is InputEventScreenTouch:
		if event.pressed and event.position.x > get_viewport().size.x * 0.4:
			touch_index = event.index
		elif not event.pressed and event.index == touch_index:
			touch_index = -1

	if event is InputEventScreenDrag and event.index == touch_index:
		rotate_camera(event.relative.x * touch_sensitivity, event.relative.y * touch_sensitivity)

func rotate_camera(yaw: float, pitch: float) -> void:
	rotation.y -= yaw
	rotation.x -= pitch
	rotation.x = clamp(rotation.x, deg_to_rad(min_pitch), deg_to_rad(max_pitch))

func _physics_process(delta: float) -> void:
	if target:
		global_position = global_position.lerp(target.global_position + Vector3(0, 1.5, 0), delta * 15.0)
`
  },
  {
    path: 'scripts/cyber_cafe.gd',
    name: 'cyber_cafe.gd',
    description: 'Maa Tara Cyber Point - Online Job Form & College Exam Fillup System',
    code: `extends Node3D
class_name CyberCafeSystem

# Handles online examination forms, admit card generation,
# resume building, and business takeover.

signal terminal_opened(pc_id: int)
signal form_submitted(job_title: String, fee_paid: int)

@export var pc_nodes: Array[Node3D] = []
var active_pc: int = 0
var business_owner: bool = false
var daily_net_profit: int = 1200

func on_interact(player: Node) -> void:
	terminal_opened.emit(active_pc)

func apply_for_job(job_id: String, fee: int, player_data: Dictionary) -> bool:
	if player_data.get("money_bank", 0) >= fee:
		player_data["money_bank"] -= fee
		form_submitted.emit(job_id, fee)
		print("Form successfully submitted for: ", job_id, " | Txn ID: CAFE-", randi() % 90000 + 10000)
		return true
	return false

func purchase_cafe(player_data: Dictionary) -> bool:
	var price = 150000
	if player_data.get("money_bank", 0) >= price and not business_owner:
		player_data["money_bank"] -= price
		business_owner = true
		print("Congratulations! You now own Maa Tara Cyber Point!")
		return true
	return false
`
  },
  {
    path: 'scripts/save_system.gd',
    name: 'save_system.gd',
    description: 'Local Save & Load manager for user data on Android / PC storage',
    code: `extends Node
class_name SaveManager

const SAVE_PATH: String = "user://indian_life_rp_save.json"

static func save_game(data: Dictionary) -> bool:
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if not file:
		push_error("Failed to open save file at: " + SAVE_PATH)
		return false

	var json_string = JSON.stringify(data, "  ")
	file.store_string(json_string)
	file.close()
	print("Game saved successfully to: ", SAVE_PATH)
	return true

static func load_game() -> Dictionary:
	if not FileAccess.file_exists(SAVE_PATH):
		print("No previous save file found at: ", SAVE_PATH)
		return {}

	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return {}

	var content = file.get_as_text()
	file.close()

	var test_json = JSON.new()
	var parse_err = test_json.parse(content)
	if parse_err == OK:
		return test_json.data
	return {}
`
  },
  {
    path: 'export_presets.cfg',
    name: 'export_presets.cfg',
    description: 'Godot 4 Android APK Export Configuration Profile (Release/Debug)',
    code: `[preset.0]

name="Android APK Package"
platform="Android"
runnable=true
advanced_options=false
dedicated_server=false
custom_features=""
export_filter="all_resources"
include_filter=""
exclude_filter=""
export_path="./build/IndianLifeRP_v1.0.apk"
encryption_include_filters=""
encryption_exclude_filters=""
encrypt_pck=false
encrypt_directory=false

[preset.0.options]

custom_template/debug=""
custom_template/release=""
gradle_build/use_gradle_build=false
gradle_build/export_format=0
gradle_build/min_sdk="24"
gradle_build/target_sdk="34"
package/unique_name="com.indianliferp.middleclass"
package/name="Indian Life RP: Middle Class Edition"
package/signed=true
package/architecture/arm64-v8a=true
package/architecture/armeabi-v7a=true
package/architecture/x86_64=true
screen/orientation=1
`
  },
  {
    path: 'android/build/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    description: 'Android App Manifest with permissions, fullscreen mode, and launcher',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.indianliferp.middleclass"
    android:versionCode="1"
    android:versionName="1.0.0"
    android:installLocation="auto">

    <supports-screens
        android:smallScreens="true"
        android:normalScreens="true"
        android:largeScreens="true"
        android:xlargeScreens="true" />

    <uses-feature android:glEsVersion="0x00030000" android:required="true" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="true" />
    <uses-feature android:name="android.hardware.touchscreen.multitouch" android:required="false" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:label="Indian Life RP"
        android:icon="@mipmap/icon"
        android:allowBackup="true"
        android:isGame="true"
        android:hasCode="true"
        android:appCategory="game">

        <activity
            android:name="org.godotengine.godot.GodotActivity"
            android:label="Indian Life RP"
            android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
            android:launchMode="singleTask"
            android:screenOrientation="sensorLandscape"
            android:configChanges="orientation|keyboardHidden|screenSize|smallestScreenSize|density|keyboard|navigation"
            android:resizeableActivity="false"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  }
];

