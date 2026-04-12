import * as THREE from 'three'

export default class InformationSection {
    constructor(_options) {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        this.setStatic()
        this.setBaguettes()
        this.setLinks()
        this.setActivities()
        this.setTiles()
    }

    setStatic() {
        // 隐藏 x < 3 的所有子网格（这恰好去掉了铁塔、国旗，以及最左边的那个 Twitter 雕塑）
        const toRemoveVisual = []
        this.resources.items.informationStaticBase.scene.traverse((child) => {
            if (child.isMesh && child.position.x < 3) {
                toRemoveVisual.push(child)
            }
        })
        toRemoveVisual.forEach(child => child.parent.remove(child))

        const toRemoveCollision = []
        if (this.resources.items.informationStaticCollision) {
            this.resources.items.informationStaticCollision.scene.traverse((child) => {
                if (child.isMesh && child.position.x < 3) {
                    toRemoveCollision.push(child)
                }
            })
            toRemoveCollision.forEach(child => child.parent.remove(child))
        }

        this.objects.add({
            base: this.resources.items.informationStaticBase.scene,
            collision: this.resources.items.informationStaticCollision.scene,
            floorShadowTexture: this.resources.items.informationStaticFloorShadowTexture,
            offset: new THREE.Vector3(this.x, this.y, 0),
            mass: 0
        })
    }

    setBaguettes() {
        // (已清空，移除长面包模型)
    }

    setLinks() {
        // Set up
        this.links = {}
        this.links.x = 4.35 // 从 github 的雕塑位置开始，对应原项目 x: 4.35
        this.links.y = - 1.5
        this.links.halfExtents = {}
        this.links.halfExtents.x = 1
        this.links.halfExtents.y = 1
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = - 1.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [

            {
                href: 'https://github.com/louis-builds',
                labelTexture: this.resources.items.informationContactGithubLabelTexture
            },
            {
                href: 'https://www.linkedin.com/in/louis-she-60718b360/',
                labelTexture: this.resources.items.informationContactLinkedinLabelTexture
            },
            {
                href: 'mailto:l224706043@gmail.com',
                labelTexture: this.resources.items.informationContactMailLabelTexture
            }
        ]

        // Create each link
        let i = 0
        for (const _option of this.links.options) {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.href = _option.href

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {
                window.open(_option.href, '_blank')
            })

            // Texture
            item.texture = _option.labelTexture
            item.texture.magFilter = THREE.NearestFilter
            item.texture.minFilter = THREE.LinearFilter

            // Create label
            item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
            item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
            item.labelMesh.position.y = item.y + this.links.labelOffset
            item.labelMesh.matrixAutoUpdate = false
            item.labelMesh.updateMatrix()
            this.links.container.add(item.labelMesh)

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setActivities() {
        // Set up
        this.activities = {}
        this.activities.x = this.x + 0
        this.activities.y = this.y - 10
        this.activities.multiplier = 5.5

        // Geometry
        this.activities.geometry = new THREE.PlaneGeometry(2 * this.activities.multiplier, 1 * this.activities.multiplier, 1, 1)

        // 使用 Canvas 动态绘制文字
        const canvas = document.createElement('canvas')
        canvas.width = 2048
        canvas.height = 1024
        const context = canvas.getContext('2d')

        // 保持透明背景，像原图一样贴在地上
        context.clearRect(0, 0, canvas.width, canvas.height)

        // 绘制文字的帮助函数
        const drawText = (text, x, y, size, color, isBold = false) => {
            context.fillStyle = color
            context.font = `${isBold ? 'bolder' : 'normal'} ${size}px Arial`
            context.textAlign = 'left'
            context.textBaseline = 'top'
            context.fillText(text, x, y)
        }

        let currentY = 50
        const startX = 100

        // 大标题
        drawText('EXPERIENCE & ACTIVITIES', startX, currentY, 120, '#ff8908', true)
        currentY += 120

        // 经历数据
        const exps = [
            { date: '2026-Present', title: 'Univ. of Auckland | Teaching Assistant', bullets: ['Tutor for Math & Programming, debugging complex code for students.'] },
            { date: '2023-2024', title: 'SuYing Vision | Software Engineer', bullets: ['Delivered 200 AI smart cameras for Samsung iPhone 15 inspection line.', 'Led Linux-based control framework and Qt host interface development.'] },
            { date: '2021-2023', title: 'Honor (HUAWEI) | Software Engineer', bullets: ['Improved image processing by 400ms via logical algorithm optimization.', 'Resolved critical pseudo-singleton display bugs in system UI.'] },
            { date: '2019-2021', title: 'Casco (Alstom JV) | Software Engineer', bullets: ['Developed MFC-based control SW for Bangladesh national railway project.'] }
        ]

        exps.forEach(exp => {
            // 时间和职位标题
            drawText(`[${exp.date}] ${exp.title}`, startX, currentY, 85, '#ffffff', true)
            currentY += 60
            // 细节
            // exp.bullets.forEach(b => {
            //     drawText(`• ${b}`, startX + 40, currentY, 75, '#000000ff')
            //     currentY += 45
            // })
            currentY += 20 // 每段经历留间隔
        })

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.NearestFilter
        texture.minFilter = THREE.LinearFilter

        this.activities.texture = texture

        // Material (改为 map 渲染真实颜色)
        this.activities.material = new THREE.MeshBasicMaterial({
            wireframe: false,
            map: this.activities.texture,
            transparent: true,
            depthWrite: false
        })

        // Mesh
        this.activities.mesh = new THREE.Mesh(this.activities.geometry, this.activities.material)
        this.activities.mesh.position.x = this.activities.x
        this.activities.mesh.position.y = this.activities.y
        this.activities.mesh.matrixAutoUpdate = false
        this.activities.mesh.updateMatrix()
        this.container.add(this.activities.mesh)
    }

    setTiles() {
        this.tiles.add({
            start: new THREE.Vector2(this.x - 1.2, this.y + 13),
            delta: new THREE.Vector2(0, - 20)
        })
    }
}
