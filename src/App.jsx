import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, Text, Environment } from "@react-three/drei"
import * as THREE from "three"

const Lights = () => {
    return (
        <>
            <ambientLight intensity={1} color={"#fff"} />
            <directionalLight intensity={1} position={[2, 2, 0]} color="red" distance={5} />
            <spotLight intensity={3} position={[-5, 10, 2]} angle={0.2} penumbra={1} castShadow shadow-mapSize={[2048, 2048]} />
        </>
    )
}

const useLerpMouse = (viewport) => {
    const mouseRef = useRef({ x: 0, y: 0 })

    useFrame(({ mouse }) => {
        const x = THREE.MathUtils.lerp(mouseRef.current.x, (mouse.x * viewport.width) / 2, 0.1)
        const y = THREE.MathUtils.lerp(mouseRef.current.y, (mouse.y * viewport.height) / 2, 0.1)

        mouseRef.current.x = x
        mouseRef.current.y = y
    })

    return mouseRef
}

const Model = ({ src }) => {
    const { viewport } = useThree()
    const { nodes } = useGLTF(src)

    const mouseRef = useLerpMouse(viewport)
    const hoverRef = useRef(0)
    const model = useRef()

    useFrame(({ camera, clock }) => {
        model.current.lookAt(mouseRef.current.x, mouseRef.current.y, camera.position.z)

        hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, THREE.MathUtils.mapLinear(Math.sin(clock.getElapsedTime() * 4), -1, 1, -0.25, 0.25), 0.01)
        model.current.position.y = hoverRef.current
    })

    // useEffect(() => {

    //     const eyeComponents = Object.keys(nodes).filter((n) => n.startsWith("Eye"))
    //     for(const component of eyeComponents) {
    //         const node = model.current.getObjectByName(component)
    //         // node.rotation.y +=
    //     }

    // }, [])

    return (
        <group scale={[0.1, 0.1, 0.1]} position={[0, 0, 0.1]} ref={model}>
            {Object.values(nodes).map((o, i) => (
                <primitive object={o} key={i} />
            ))}
        </group>
    )
}

const App = () => {
    return (
        <Suspense fallback={<p>loading...</p>}>
            <Canvas shadows camera={{ position: [0, 0, 1], fov: 75, near: 0.1, far: 10 }} gl={{ alpha: false, antialias: false }}>
                <color attach="background" args={["white"]} />
                <fog attach="fog" args={["#000", 0.8, 1]} />
                <Model src="./ghost/scene.gltf" />
                <Lights />

                <mesh position={[0, 0, -0.1]} scale={4}>
                    <planeGeometry />
                    <meshStandardMaterial color="#000" toneMapped={false} fog={false} envMapIntensity={0} />
                </mesh>
            </Canvas>
        </Suspense>
    )
}

export default App
