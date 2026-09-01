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
        this.setKeywords()
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

    setKeywords() {
        // Set up —— 用不同高度悬浮的关键字取代原来的 EXPERIENCE & ACTIVITIES 文字板
        this.keywords = {}
        this.keywords.container = new THREE.Object3D()
        this.keywords.container.matrixAutoUpdate = false
        this.keywords.container.updateMatrix()
        this.container.add(this.keywords.container)

        // 关键字：文字 / 主色 / 相对位置(x,y) / 悬浮基准高度 z / 浮动幅度 / 速度 / 字号
        const definitions = [
            { text: 'C++', color: '#38bdf8', x: - 9.0, y: 4.5,  z: 3.6, amp: 0.55, speed: 0.0016, size: 180 },
            { text: 'Python',      color: '#f59e0b', x: - 6.4, y: 11.0, z: 2.2, amp: 0.45, speed: 0.0021, size: 215 },
            { text: 'Embedded', color: '#a78bfa', x: - 3.8, y: 5.5,  z: 4.2, amp: 0.60, speed: 0.0014, size: 165 },
            { text: 'Linux',    color: '#34d399', x: - 1.2, y: 12.0, z: 1.8, amp: 0.42, speed: 0.0019, size: 200 },
            { text: 'AI Agent',      color: '#f87171', x:   1.4, y: 4.0,  z: 3.2, amp: 0.50, speed: 0.0017, size: 220 },
            { text: 'C#',       color: '#f472b6', x:   4.0, y: 11.5, z: 2.6, amp: 0.48, speed: 0.0022, size: 220 },
            { text: 'AWS',   color: '#facc15', x:   6.6, y: 5.0,  z: 4.0, amp: 0.58, speed: 0.0015, size: 190 },
            { text: 'MCP',       color: '#7b2dd4', x:   9.2, y: 12.5, z: 2.0, amp: 0.40, speed: 0.0024, size: 215 }
        ]

        this.keywords.items = []

        for (const _def of definitions) {
            // 每个关键字单独画一张透明底的霓虹文字贴图
            const canvas = document.createElement('canvas')
            canvas.width = 1024
            canvas.height = 384
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = `900 ${_def.size}px "Arial Black", Arial, sans-serif`

            const cx = canvas.width / 2
            const cy = canvas.height / 2

            // 3D 挤压厚度
            for (let i = 14; i >= 1; i--) {
                ctx.fillStyle = 'rgba(8, 18, 32, 0.5)'
                ctx.fillText(_def.text, cx - i * 0.6, cy + i)
            }

            // 霓虹发光正面
            ctx.save()
            ctx.shadowColor = _def.color
            ctx.shadowBlur = 45
            ctx.fillStyle = _def.color
            ctx.fillText(_def.text, cx, cy)
            ctx.restore()

            // 白色描边
            ctx.lineWidth = 4
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.strokeText(_def.text, cx, cy)

            const texture = new THREE.CanvasTexture(canvas)
            texture.magFilter = THREE.LinearFilter
            texture.minFilter = THREE.LinearFilter
            texture.anisotropy = 4

            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                map: texture,
                depthWrite: false
            })

            // 平面按画布比例 (1024:384 ≈ 2.67:1)
            const width = 4.4
            const geometry = new THREE.PlaneGeometry(width, width * 0.375, 1, 1)
            const mesh = new THREE.Mesh(geometry, material)

            mesh.position.set(this.x + _def.x, this.y - 10 + _def.y, _def.z)
            mesh.rotation.x = Math.PI * 0.25
            mesh.rotation.z = (Math.random() - 0.5) * 0.14

            this.keywords.container.add(mesh)

            this.keywords.items.push({
                mesh,
                baseZ: _def.z,
                baseRotX: mesh.rotation.x,
                baseRotZ: mesh.rotation.z,
                amp: _def.amp,
                speed: _def.speed,
                phase: Math.random() * Math.PI * 2
            })
        }

        // 悬浮动画：各自不同的高度、相位与旋转摆动，营造漂浮的酷炫效果
        this.time.on('tick', () => {
            const e = this.time.elapsed
            for (const _item of this.keywords.items) {
                _item.mesh.position.z = _item.baseZ + Math.sin(e * _item.speed + _item.phase) * _item.amp
                _item.mesh.rotation.z = _item.baseRotZ + Math.sin(e * _item.speed * 0.6 + _item.phase) * 0.05
                _item.mesh.rotation.x = _item.baseRotX + Math.sin(e * _item.speed * 0.8 + _item.phase) * 0.03
            }
        })
    }

    setTiles() {
        this.tiles.add({
            start: new THREE.Vector2(this.x - 1.2, this.y + 13),
            delta: new THREE.Vector2(0, - 20)
        })
    }
}
