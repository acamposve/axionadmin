<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Categories') }}
        </h2>
    </x-slot>
    <div class="flex justify-center items-center h-screen">
        <div class="w-3/4 p-4 bg-white rounded-lg shadow-lg">
            <h2 class="text-lg font-bold mb-4">Add Category</h2>
            <form action="{{ route('categories.store') }}" method="POST">
                @csrf
                <div class="mb-4">
                    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300" id="name" name="name" placeholder="Enter category name">
                </div>
                <button type="submit" class="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600">Submit</button>
            </form>
        </div>
    </div>


</x-app-layout>
